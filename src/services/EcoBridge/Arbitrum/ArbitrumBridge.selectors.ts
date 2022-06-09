import { createSelector } from '@reduxjs/toolkit'
import { OutgoingMessageState } from 'arb-ts'
import { AppState } from '../../../state'
import {
  BridgeTransactionLog,
  BridgeTransactionStatus,
  BridgeTransactionSummary,
  ArbitrumBridgeTxn,
} from '../../../state/bridgeTransactions/types'
import { getBridgeTxStatus, txnTypeToOrigin } from '../../../utils/arbitrum'
import { ArbitrumList } from '../EcoBridge.types'
import { ecoBridgeConfig } from '../EcoBridge.config'
import { ArbitrumPendingReasons } from './ArbitrumBridge.types'
import { ChainId } from '@swapr/sdk'
import { arbitrumTransactionsAdapter } from './ArbitrumBridge.adapter'
import { normalizeInputValue } from '../../../utils'

const getSupportedChains = (bridgeId: string) => {
  const bridge = ecoBridgeConfig.find(config => config.bridgeId === bridgeId)
  if (!bridge) return [] as ChainId[]
  return Object.values(bridge.supportedChains[0]).map(Number) as ChainId[]
}

const createSelectOwnedTransactions = (bridgeId: ArbitrumList) => {
  const transactionsSelector = createSelector([(state: AppState) => state], state =>
    arbitrumTransactionsAdapter.getSelectors().selectAll(state.ecoBridge[bridgeId].transactions)
  )

  return createSelector(
    [transactionsSelector, (state: AppState, account: string | undefined) => account],
    (txs, account) => {
      if (account) {
        const normalizedAccount = account.toLowerCase()

        return txs.filter(tx => tx.sender.toLowerCase() === normalizedAccount)
      }
      return []
    }
  )
}

const createSelectPendingTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => txs.filter(tx => !tx.receipt))

const createSelectL1Deposits = (
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>,
  bridgeId: ArbitrumList
) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = getSupportedChains(bridgeId)
    const l1ChainId = Math.min(...chains)

    return txs.filter(tx => {
      if (tx.chainId === l1ChainId && (tx.type === 'deposit' || tx.type === 'deposit-l1') && tx.receipt?.status === 1) {
        return tx
      }
      return []
    })
  })

const createSelectPendingWithdrawals = (
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>,
  bridgeId: ArbitrumList
) =>
  createSelector([selectOwnedTxs], txs => {
    const chains = getSupportedChains(bridgeId)
    const l2ChainId = Math.max(...chains)

    return txs.filter(
      tx =>
        tx.chainId === l2ChainId && tx.type === 'withdraw' && tx.outgoingMessageState !== OutgoingMessageState.EXECUTED
    )
  })

const createBridgeLog = (transactions: ArbitrumBridgeTxn[]): BridgeTransactionLog[] => {
  return transactions.map(tx => ({
    txHash: tx.txHash,
    chainId: tx.chainId,
  }))
}

const createSelectBridgeTransactionsSummary = (
  bridgeId: ArbitrumList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs, (state: AppState) => state.ecoBridge.ui.isCheckingWithdrawals], (txs, isLoading) => {
    const chains = getSupportedChains(bridgeId)
    const l1ChainId = Math.min(...chains)
    const l2ChainId = Math.max(...chains)

    const l1Txs = txs.filter(tx => tx.chainId === l1ChainId)
    const l2Txs = txs.filter(tx => tx.chainId === l2ChainId)

    const processedTxsMap: {
      [txHash: string]: string
    } = {}

    const l1Summaries = l1Txs.reduce<BridgeTransactionSummary[]>((total, tx) => {
      const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
      const to = from === l1ChainId ? l2ChainId : l1ChainId

      const {
        assetName,
        assetAddressL1,
        assetAddressL2,
        value,
        txHash,
        batchIndex,
        batchNumber,
        timestampResolved,
      } = tx

      const normalizedValue = normalizeInputValue(value, true)

      if (processedTxsMap[tx.txHash]) return total
      const summary: BridgeTransactionSummary = {
        assetName,
        assetAddressL1,
        assetAddressL2,
        fromChainId: from,
        toChainId: to,
        status: getBridgeTxStatus(tx.receipt?.status),
        value: normalizedValue,
        txHash,
        batchIndex,
        batchNumber,
        pendingReason: tx.receipt?.status ? undefined : ArbitrumPendingReasons.TX_UNCONFIRMED,
        timestampResolved,
        log: [],
        bridgeId,
      }

      const partnerTx = l2Txs.find(l2Txn => l2Txn.txHash === tx.partnerTxHash)

      if (!tx.partnerTxHash || !partnerTx) {
        if (tx.type === 'deposit-l1' && tx.receipt?.status !== 0) {
          summary.status = BridgeTransactionStatus.PENDING // deposits on l1 should never show confirmed on ui
          summary.pendingReason = ArbitrumPendingReasons.TX_UNCONFIRMED
        }
        summary.log = createBridgeLog([tx])
        processedTxsMap[tx.txHash] = tx.txHash
        total.push(summary)
        return total
      }
      if (tx.type === 'outbox') {
        const status = tx.receipt?.status
        summary.fromChainId = to
        summary.toChainId = from
        summary.status = status === 1 ? BridgeTransactionStatus.CLAIMED : getBridgeTxStatus(status)
        summary.pendingReason = status ? undefined : ArbitrumPendingReasons.TX_UNCONFIRMED
        summary.log = createBridgeLog([partnerTx, tx])
        processedTxsMap[tx.txHash] = tx.txHash
        processedTxsMap[tx.partnerTxHash] = tx.partnerTxHash
        total.push(summary)
        return total
      }
      if (tx.type === 'deposit-l1' && tx.receipt) {
        const statusL2 = partnerTx.receipt?.status
        if (tx.receipt?.status === 0 || statusL2 === 0) {
          summary.status = BridgeTransactionStatus.FAILED
        } else {
          summary.status = getBridgeTxStatus(statusL2)
          summary.pendingReason = statusL2 ? undefined : ArbitrumPendingReasons.DEPOSIT
          summary.timestampResolved = partnerTx.timestampResolved
        }
        summary.log = createBridgeLog([tx, partnerTx])
        processedTxsMap[tx.txHash] = tx.txHash
        processedTxsMap[tx.partnerTxHash] = tx.partnerTxHash
        total.push(summary)
        return total
      }
      return total
    }, [])

    const l2Summaries = l2Txs.reduce<BridgeTransactionSummary[]>((total, tx) => {
      const from = txnTypeToOrigin(tx.type) === 1 ? l1ChainId : l2ChainId
      const to = from === l1ChainId ? l2ChainId : l1ChainId

      const {
        assetAddressL1,
        assetAddressL2,
        assetName,
        value,
        txHash,
        batchIndex,
        batchNumber,
        timestampResolved,
      } = tx

      const normalizedValue = normalizeInputValue(value, true)

      if (processedTxsMap[tx.txHash]) return total
      const summary: BridgeTransactionSummary = {
        assetName,
        assetAddressL1,
        assetAddressL2,
        value: normalizedValue,
        txHash,
        batchNumber,
        batchIndex,
        fromChainId: from,
        toChainId: to,
        status: getBridgeTxStatus(tx.receipt?.status),
        timestampResolved,
        log: [],
        bridgeId,
      }

      const partnerTx = l1Txs.find(l1Txn => tx.txHash === l1Txn.partnerTxHash)
      // WITHDRAWAL L2
      if (!tx.partnerTxHash || !partnerTx) {
        if (tx.type === 'withdraw') {
          if (isLoading) {
            summary.timestampResolved = undefined
            summary.status = BridgeTransactionStatus.LOADING
          } else {
            if (tx.receipt?.status !== 0) {
              switch (tx.outgoingMessageState) {
                case OutgoingMessageState.CONFIRMED:
                  summary.status = BridgeTransactionStatus.REDEEM
                  summary.timestampResolved = undefined
                  break
                case OutgoingMessageState.EXECUTED:
                  summary.status = BridgeTransactionStatus.CLAIMED
                  break
                default:
                  summary.status = BridgeTransactionStatus.PENDING
                  summary.pendingReason = ArbitrumPendingReasons.WITHDRAWAL
                  summary.timestampResolved = undefined
              }
            } else {
              summary.status = BridgeTransactionStatus.FAILED
            }
          }
        }
        summary.log = createBridgeLog([tx])

        processedTxsMap[tx.txHash] = tx.txHash
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
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsErrorMessage,
    ],
    (details, loading, errorMessage) => {
      return {
        bridgeId,
        details,
        loading,
        errorMessage,
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
      const selectL1Deposits = createSelectL1Deposits(selectOwnedTransactions, bridgeId)
      const selectPendingWithdrawals = createSelectPendingWithdrawals(selectOwnedTransactions, bridgeId)

      const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)

      const selectBridgingDetails = createSelectBridgingDetails(bridgeId)

      const selectors = {
        selectOwnedTransactions,
        selectPendingTransactions,
        selectL1Deposits,
        selectBridgeTransactionsSummary,
        selectPendingWithdrawals,
        selectBridgingDetails,
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
