import { createSelector } from '@reduxjs/toolkit'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { OutgoingMessageState } from 'arb-ts'
import { AppState } from '../../../state'
import { BridgeTxsFilter } from '../../../state/bridge/reducer'
import {
  BridgeTransactionLog,
  BridgeTransactionSummary,
  BridgeTxn,
  BridgeTxnsState
} from '../../../state/bridgeTransactions/types'
import { listToTokenMap } from '../../../state/lists/hooks'
import { getBridgeTxStatus, PendingReasons, txnTypeToOrigin } from '../../../utils/arbitrum'
import { ArbitrumList, TokenMap } from '../Omnibridge.types'
import { hasArbitrumMetadata } from './ArbitrumBridge.types'

const createSelectOwnedTxs = (bridgeId: ArbitrumList) =>
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
      return [...total, ...Object.values(txsPerChain ?? {}).filter(tx => !tx?.receipt)]
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

type CreateBridgeLogProps = Pick<BridgeTransactionSummary, 'fromChainId' | 'toChainId'> & {
  transactions: BridgeTxn[]
}

const createBridgeLog = ({ transactions, fromChainId, toChainId }: CreateBridgeLogProps): BridgeTransactionLog[] => {
  return transactions.map(tx => ({
    txHash: tx.txHash,
    chainId: tx.chainId,
    toChainId,
    fromChainId,
    type: tx.type,
    status: getBridgeTxStatus(tx.receipt?.status)
  }))
}

const createSelectBridgeTxsSummary = (
  bridgeId: ArbitrumList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>
) =>
  createSelector(
    [
      selectOwnedTxs,
      (state: AppState) => state.bridge.isCheckingWithdrawals,
      (state: AppState) => state.bridge.txsFilter
    ],
    (txs, isLoading, txsFilter) => {
      const [l1ChainId, l2ChainId] = Object.keys(txs).map(key => Number(key))

      const l1Txs = txs[l1ChainId]
      const l2Txs = txs[l2ChainId]

      const processedTxsMap: {
        [chainId: number]: {
          [txHash: string]: string
        }
      } = { [l1ChainId]: {}, [l2ChainId]: {} }

      const l1Summaries = Object.values(l1Txs ?? {}).reduce<BridgeTransactionSummary[]>((total, tx) => {
        const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
        const to = from === l1ChainId ? l2ChainId : l1ChainId

        if (processedTxsMap[l1ChainId][tx.txHash]) return total

        const summary: BridgeTransactionSummary = {
          assetName: tx.assetName,
          assetAddressL1: tx.assetAddressL1,
          assetAddressL2: tx.assetAddressL2,
          fromChainId: from,
          toChainId: to,
          status: getBridgeTxStatus(tx.receipt?.status),
          value: tx.value,
          txHash: tx.txHash,
          batchIndex: tx.batchIndex,
          batchNumber: tx.batchNumber,
          pendingReason: tx.receipt?.status ? undefined : PendingReasons.TX_UNCONFIRMED,
          timestampResolved: tx.timestampResolved,
          log: [],
          bridgeId
        }
        if (!tx.partnerTxHash || !l2Txs[tx.partnerTxHash]) {
          if (tx.type === 'deposit-l1' && tx.receipt?.status !== 0) {
            summary.status = 'pending' // deposits on l1 should never show confirmed on UI
            summary.pendingReason = PendingReasons.TX_UNCONFIRMED
          }

          summary.log = createBridgeLog({ transactions: [tx], fromChainId: from, toChainId: to })
          processedTxsMap[l1ChainId][tx.txHash] = tx.txHash

          total.push(summary)
          return total
        }

        if (tx.type === 'outbox') {
          const status = tx.receipt?.status

          summary.fromChainId = to
          summary.toChainId = from
          summary.status = status === 1 ? 'claimed' : getBridgeTxStatus(status)
          summary.pendingReason = status ? undefined : PendingReasons.TX_UNCONFIRMED
          summary.log = createBridgeLog({
            transactions: [l2Txs[tx.partnerTxHash], tx],
            fromChainId: to,
            toChainId: from
          })

          processedTxsMap[l1ChainId][tx.txHash] = tx.txHash
          processedTxsMap[l2ChainId][tx.partnerTxHash] = tx.partnerTxHash // skip partner tx in l2Summaries

          total.push(summary)
          return total
        }

        if (tx.type === 'deposit-l1' && tx.receipt) {
          const statusL2 = l2Txs[tx.partnerTxHash].receipt?.status
          if (tx.receipt?.status === 0 || statusL2 === 0) {
            summary.status = 'failed'
          } else {
            summary.status = getBridgeTxStatus(statusL2)
            summary.pendingReason = statusL2 ? undefined : PendingReasons.DESPOSIT
            summary.timestampResolved = l2Txs[tx.partnerTxHash].timestampResolved
          }

          summary.log = createBridgeLog({
            transactions: [tx, l2Txs[tx.partnerTxHash]],
            fromChainId: from,
            toChainId: to
          })

          processedTxsMap[l1ChainId][tx.txHash] = tx.txHash
          processedTxsMap[l2ChainId][tx.partnerTxHash] = tx.partnerTxHash // skip partner tx in l2Summaries

          total.push(summary)
          return total
        }
        return total
      }, [])

      const l2Summaries = Object.values(l2Txs ?? {}).reduce<BridgeTransactionSummary[]>((total, tx) => {
        const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
        const to = from === l1ChainId ? l2ChainId : l1ChainId

        if (processedTxsMap[l2ChainId][tx.txHash]) return total

        const summary: BridgeTransactionSummary = {
          assetName: tx.assetName,
          assetAddressL1: tx.assetAddressL1,
          assetAddressL2: tx.assetAddressL2,
          value: tx.value,
          txHash: tx.txHash,
          batchNumber: tx.batchNumber,
          batchIndex: tx.batchIndex,
          fromChainId: from,
          toChainId: to,
          status: getBridgeTxStatus(tx.receipt?.status),
          timestampResolved: tx.timestampResolved,
          log: [],
          bridgeId
        }

        // WITHDRAWAL L2
        if (!tx.partnerTxHash || !l1Txs[tx.partnerTxHash]) {
          if (tx.type === 'withdraw') {
            if (!isLoading) {
              if (tx.receipt?.status !== 0) {
                switch (tx.outgoingMessageState) {
                  case OutgoingMessageState.CONFIRMED:
                    summary.status = 'redeem'
                    summary.timestampResolved = undefined
                    break
                  case OutgoingMessageState.EXECUTED:
                    summary.status = 'claimed'
                    break
                  default:
                    summary.status = 'pending'
                    summary.pendingReason = PendingReasons.WITHDRAWAL
                    summary.timestampResolved = undefined
                }
              } else {
                summary.status = 'failed'
              }
            } else {
              summary.status = 'loading'
              summary.timestampResolved = undefined
            }
          }
          summary.log = createBridgeLog({ transactions: [tx], fromChainId: from, toChainId: to })

          processedTxsMap[l2ChainId][tx.txHash] = tx.txHash

          total.push(summary)
          return total
        }

        return total
      }, [])
      const retVal = [...l1Summaries, ...l2Summaries].reverse()

      switch (txsFilter) {
        case BridgeTxsFilter.COLLECTABLE:
          return retVal.filter(summary => summary.status === 'redeem')
        case BridgeTxsFilter.RECENT:
          const passed24h = new Date().getTime() - 1000 * 60 * 60 * 24
          return retVal.filter(summary => {
            if (!summary.timestampResolved) return true
            return summary.timestampResolved >= passed24h
          })
        default:
          return retVal
      }
    }
  )

const createSelectTokenList = (bridgeId: ArbitrumList) =>
  createSelector(
    (state: AppState) => state.omnibridge[bridgeId].lists,
    (state: AppState) => state.omnibridge.common.supportedChains?.[bridgeId],
    (l2TokenLists, supportedChains) => {
      // Duplicate each list and adjust it to fit L1 addresses
      if (!supportedChains) return {}
      const { from, to } = supportedChains

      const l1TokenLists = l2TokenLists.map(list => {
        const { tokens } = list

        const l1Tokens = tokens
          .filter(token => token.chainId === Number(to))
          .reduce((tokens, l2Token) => {
            if (hasArbitrumMetadata(l2Token, from)) {
              const castedFrom = Number(from)
              const l1Token: typeof l2Token = {
                ...l2Token,
                chainId: castedFrom,
                address: l2Token.extensions.bridgeInfo[castedFrom].tokenAddress
              }
              tokens.push(l1Token)
            }
            return tokens
          }, [] as TokenInfo[])

        const l1List: typeof list = {
          ...list,
          tokens: l1Tokens
        }

        return l1List
      })

      const combinedTokenMap = [...l1TokenLists, ...l2TokenLists].reduce((allTokens, list) => {
        const tokenMap = listToTokenMap((list as unknown) as TokenList, false)

        allTokens[to] = { ...allTokens[to], ...tokenMap[to] }
        allTokens[from] = { ...allTokens[from], ...tokenMap[from] }

        return allTokens
      }, {} as TokenMap)

      return combinedTokenMap
    }
  )

export interface ArbitrumBridgeSelectors {
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>
  selectPendingTxs: ReturnType<typeof createSelectPendingTxs>
  selectL1Deposits: ReturnType<typeof createSelectL1Deposits>
  selectPendingWithdrawals: ReturnType<typeof createSelectPendingWithdrawals>
  selectBridgeTxsSummary: ReturnType<typeof createSelectBridgeTxsSummary>
  selectTokenList: ReturnType<typeof createSelectTokenList>
}

export const arbitrumSelectorsFactory = (arbBridges: ArbitrumList[]) => {
  return arbBridges.reduce(
    (total, bridgeId) => {
      const selectTokenList = createSelectTokenList(bridgeId)
      const selectOwnedTxs = createSelectOwnedTxs(bridgeId)
      const selectPendingTxs = createSelectPendingTxs(selectOwnedTxs)
      const selectL1Deposits = createSelectL1Deposits(selectOwnedTxs)
      const selectPendingWithdrawals = createSelectPendingWithdrawals(selectOwnedTxs)

      const selectBridgeTxsSummary = createSelectBridgeTxsSummary(bridgeId, selectOwnedTxs)

      const selectors = {
        selectOwnedTxs,
        selectPendingTxs,
        selectL1Deposits,
        selectTokenList,
        selectBridgeTxsSummary,
        selectPendingWithdrawals
      }

      total[bridgeId] = selectors
      return total
    },
    {} as {
      [k in ArbitrumList]: ArbitrumBridgeSelectors
    }
  )
}

export const arbitrumSelectors = arbitrumSelectorsFactory(['arbitrum:mainnet', 'arbitrum:testnet'])
