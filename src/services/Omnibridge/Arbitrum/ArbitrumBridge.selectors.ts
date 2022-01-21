import { createSelector } from '@reduxjs/toolkit'
import { OutgoingMessageState } from 'arb-ts'
import { AppState } from '../../../state'
import { BridgeTxn, BridgeTxnsState } from '../../../state/bridgeTransactions/types'
import { BridgeList } from '../Omnibridge.types'

const createSelectOwnedTxs = (bridgeId: BridgeList) =>
  createSelector(
    [
      (state: AppState) => state.omnibridge[bridgeId].transactions,
      (state: AppState, account: string | undefined) => account
    ],
    (txs, account) => {
      const transactions: BridgeTxnsState = {}

      if (account) {
        const chains = Object.keys(txs).map(key => Number(key))

        chains.forEach(chainId => {
          const txPerChain: { [hash: string]: BridgeTxn } = {}

          Object.values(txs[chainId] ?? {}).forEach(tx => {
            if (tx.sender !== account) return
            txPerChain[tx.txHash] = tx
          })

          transactions[chainId] = txPerChain
        })
      }

      return transactions
    }
  )

const createSelectPendingTxs = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>) =>
  createSelector([selectOwnedTxs], txs => {
    return Object.values(txs).reduce((total, txsPerChain) => {
      return {
        ...total,
        ...Object.values(txsPerChain ?? {}).filter(tx => !tx?.receipt)
      }
    }, [] as BridgeTxn[])
  })

const createSelectL1Deposits = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = Object.keys(txs).map(key => Number(key))
    const l1ChainId = Math.min(...chains)

    return Object.values(txs[l1ChainId] ?? {}).filter(tx => {
      return (tx.type === 'deposit' || tx.type === 'deposit-l1') && tx?.receipt?.status === 1
    })
  })

const createSelectPendingWithdrawals = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = Object.keys(txs).map(key => Number(key))
    const l2ChainId = Math.max(...chains)

    return Object.values(txs[l2ChainId] ?? {}).filter(
      tx => tx.type === 'withdraw' && tx.outgoingMessageState !== OutgoingMessageState.EXECUTED
    )
  })

export interface ArbitrumBridgeSelectors {
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>
  selectPendingTxs: ReturnType<typeof createSelectPendingTxs>
  selectL1Deposits: ReturnType<typeof createSelectL1Deposits>
  selectPendingWithdrawals: ReturnType<typeof createSelectPendingWithdrawals>
}

export const arbitrumSelectorsFactory = (arbBridges: BridgeList[]) => {
  return arbBridges.reduce(
    (total, bridgeId) => {
      const selectOwnedTxs = createSelectOwnedTxs(bridgeId)
      const selectPendingTxs = createSelectPendingTxs(selectOwnedTxs)
      const selectL1Deposits = createSelectL1Deposits(selectOwnedTxs)
      const selectPendingWithdrawals = createSelectPendingWithdrawals(selectOwnedTxs)

      const selectors = {
        selectOwnedTxs,
        selectPendingTxs,
        selectL1Deposits,
        selectPendingWithdrawals
      }

      total[bridgeId] = selectors
      return total
    },
    {} as {
      [k in BridgeList]: ArbitrumBridgeSelectors
    }
  )
}

export const arbitrumSelectors = arbitrumSelectorsFactory([BridgeList.ARB_MAINNET, BridgeList.ARB_TESTNET])
