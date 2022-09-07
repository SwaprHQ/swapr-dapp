import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { normalizeInputValue } from '../../../utils'
import { OmniBridgeList } from '../EcoBridge.types'
import { omniTransactionsAdapter } from './OmniBridge.adapter'
import { getTransactionStatus } from './OmniBridge.utils'

const createSelectBridgingDetails = (bridgeId: OmniBridgeList) =>
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

const createSelectOwnedTransactions = (bridgeId: OmniBridgeList) => {
  const transactionsSelector = createSelector(
    [(state: AppState) => state.ecoBridge[bridgeId].transactions],
    transactions => omniTransactionsAdapter.getSelectors().selectAll(transactions)
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

const createSelectBridgeTransactionsSummary = (
  bridgeId: OmniBridgeList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs], txs => {
    const summaries = txs.map(tx => {
      const {
        txHash,
        fromValue,
        toValue,
        timestampResolved,
        assetName,
        fromChainId,
        toChainId,
        partnerTxHash,
        status,
        message,
        assetAddressL1,
        assetAddressL2,
      } = tx

      const isClaimed = !!partnerTxHash
      const isFailed = !!partnerTxHash && status === false
      const hasSignatures = message && message.signatures && message.messageData ? true : false

      const transactionStatus = getTransactionStatus(status, isClaimed, isFailed, hasSignatures)

      const pendingReason = status === BridgeTransactionStatus.PENDING ? 'Transaction has not been confirmed yet' : ''

      const normalizedFromValue = normalizeInputValue(fromValue, true)
      const normalizedToValue = normalizeInputValue(toValue, true)

      const summary: BridgeTransactionSummary = {
        txHash,
        assetName,
        fromValue: normalizedFromValue,
        toValue: normalizedToValue,
        fromChainId,
        toChainId,
        log: [{ chainId: fromChainId, txHash: txHash }],
        bridgeId,
        status: transactionStatus,
        pendingReason,
        assetAddressL1,
        assetAddressL2,
      }

      if (partnerTxHash) {
        summary.log.push({ chainId: toChainId, txHash: partnerTxHash })
      }
      if (
        transactionStatus === BridgeTransactionStatus.CLAIMED ||
        transactionStatus === BridgeTransactionStatus.CONFIRMED
      ) {
        summary.timestampResolved = timestampResolved
      }

      return summary
    })
    return summaries
  })

const createSelectPendingTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([selectOwnedTxs], txs => txs.filter(tx => tx.status === BridgeTransactionStatus.PENDING))

const createSelectAllTransactions = (bridgeId: OmniBridgeList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].transactions], txs =>
    omniTransactionsAdapter.getSelectors().selectAll(txs)
  )

export interface OmniBridgeSelectors {
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectAllTransactions: ReturnType<typeof createSelectAllTransactions>
}

export const omniBridgeSelectorsFactory = (omniBridges: OmniBridgeList[]) => {
  return omniBridges.reduce(
    (total, bridgeId) => {
      const selectBridgingDetails = createSelectBridgingDetails(bridgeId)
      const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
      const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)
      const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)
      const selectAllTransactions = createSelectAllTransactions(bridgeId)

      const selectors = {
        selectBridgingDetails,
        selectOwnedTransactions,
        selectBridgeTransactionsSummary,
        selectPendingTransactions,
        selectAllTransactions,
      }

      total[bridgeId] = selectors
      return total
    },
    {} as {
      [k in OmniBridgeList]: OmniBridgeSelectors
    }
  )
}

export const omniBridgeSelectors = omniBridgeSelectorsFactory(['omnibridge:eth-xdai'])
