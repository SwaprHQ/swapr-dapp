import { createSelector } from '@reduxjs/toolkit'
import { OutgoingMessageState } from 'arb-ts'
import { AppState } from '../../../state'
import {
  BridgeTransactionLog,
  BridgeTransactionSummary,
  BridgeTxn,
  BridgeTxnsState
} from '../../../state/bridgeTransactions/types'
import { getBridgeTxStatus, txnTypeToOrigin } from '../../../utils/arbitrum'
import { ArbitrumList } from '../EcoBridge.types'
import { ecoBridgeConfig } from '../EcoBridge.config'
import { ArbitrumPendingReasons } from './ArbitrumBridge.types'

const getSupportedChains = (bridgeId: string) => {
  const bridge = ecoBridgeConfig.find(config => config.bridgeId === bridgeId)
  if (!bridge) return [] as number[]
  return Object.values(bridge.supportedChains[0]).map(Number)
}

const createSelectOwnedTransactions = (bridgeId: ArbitrumList) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].transactions,
      (state: AppState, account: string | undefined) => account
    ],
    (txs, account) => {
      const transactions: BridgeTxnsState = {}
      const chains = getSupportedChains(bridgeId)

      if (account) {
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

const createSelectPendingTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => {
    return Object.values(txs).reduce((total, txsPerChain) => {
      return [...total, ...Object.values(txsPerChain ?? {}).filter(tx => !tx?.receipt)]
    }, [] as BridgeTxn[])
  })

const createSelectL1Deposits = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = Object.keys(txs).map(key => Number(key))
    const l1ChainId = Math.min(...chains)

    return Object.values(txs[l1ChainId] ?? {}).filter(tx => {
      return (tx.type === 'deposit' || tx.type === 'deposit-l1') && tx?.receipt?.status === 1
    })
  })

const createSelectPendingWithdrawals = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = Object.keys(txs).map(key => Number(key))
    const l2ChainId = Math.max(...chains)

    return Object.values(txs[l2ChainId] ?? {}).filter(
      tx => tx.type === 'withdraw' && tx.outgoingMessageState !== OutgoingMessageState.EXECUTED
    )
  })

const createBridgeLog = (transactions: BridgeTxn[]): BridgeTransactionLog[] => {
  return transactions.map(tx => ({
    txHash: tx.txHash,
    chainId: tx.chainId
  }))
}

const createSelectBridgeTransactionsSummary = (
  bridgeId: ArbitrumList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs, (state: AppState) => state.ecoBridge.ui.isCheckingWithdrawals], (txs, isLoading) => {
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
        pendingReason: tx.receipt?.status ? undefined : ArbitrumPendingReasons.TX_UNCONFIRMED,
        timestampResolved: tx.timestampResolved,
        log: [],
        bridgeId
      }
      if (!tx.partnerTxHash || !l2Txs[tx.partnerTxHash]) {
        if (tx.type === 'deposit-l1' && tx.receipt?.status !== 0) {
          summary.status = 'pending' // deposits on l1 should never show confirmed on ui
          summary.pendingReason = ArbitrumPendingReasons.TX_UNCONFIRMED
        }

        summary.log = createBridgeLog([tx])
        processedTxsMap[l1ChainId][tx.txHash] = tx.txHash

        total.push(summary)
        return total
      }

      if (tx.type === 'outbox') {
        const status = tx.receipt?.status

        summary.fromChainId = to
        summary.toChainId = from
        summary.status = status === 1 ? 'claimed' : getBridgeTxStatus(status)
        summary.pendingReason = status ? undefined : ArbitrumPendingReasons.TX_UNCONFIRMED
        summary.log = createBridgeLog([l2Txs[tx.partnerTxHash], tx])

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
          summary.pendingReason = statusL2 ? undefined : ArbitrumPendingReasons.DESPOSIT
          summary.timestampResolved = l2Txs[tx.partnerTxHash].timestampResolved
        }

        summary.log = createBridgeLog([tx, l2Txs[tx.partnerTxHash]])

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
                  summary.pendingReason = ArbitrumPendingReasons.WITHDRAWAL
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
        summary.log = createBridgeLog([tx])

        processedTxsMap[l2ChainId][tx.txHash] = tx.txHash

        total.push(summary)
        return total
      }

      return total
    }, [])

    return [...l1Summaries, ...l2Summaries]
  })

const createSelectBridgingDetails = (bridgeId: ArbitrumList) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetails,
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsStatus,
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsErrorMessage
    ],
    (details, loading, errorMessage) => {
      return {
        bridgeId,
        details,
        loading,
        errorMessage
      }
    }
  )

export interface ArbitrumBridgeSelectors {
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectL1Deposits: ReturnType<typeof createSelectL1Deposits>
  selectPendingWithdrawals: ReturnType<typeof createSelectPendingWithdrawals>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
}

export const arbitrumSelectorsFactory = (arbBridges: ArbitrumList[]) => {
  return arbBridges.reduce(
    (total, bridgeId) => {
      const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
      const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)
      const selectL1Deposits = createSelectL1Deposits(selectOwnedTransactions)
      const selectPendingWithdrawals = createSelectPendingWithdrawals(selectOwnedTransactions)

      const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)

      const selectBridgingDetails = createSelectBridgingDetails(bridgeId)

      const selectors = {
        selectOwnedTransactions,
        selectPendingTransactions,
        selectL1Deposits,
        selectBridgeTransactionsSummary,
        selectPendingWithdrawals,
        selectBridgingDetails
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
