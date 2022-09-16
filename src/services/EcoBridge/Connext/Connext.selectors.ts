import { formatUnits } from '@ethersproject/units'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { ConnextList } from '../EcoBridge.types'
import { connextTransactionsAdapter } from './Connext.adapter'
import { CONNEXT_TOKENS } from './Connext.lists'
import { ConnextTransactionStatus, TransactionsSummary } from './Connext.types'

const createSelectBridgingDetails = (bridgeId: ConnextList) =>
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

const createSelectOwnedTransactions = (bridgeId: ConnextList) => {
  const transactionsSelector = createSelector([(state: AppState) => state.ecoBridge[bridgeId].transactions], txs =>
    connextTransactionsAdapter.getSelectors().selectAll(txs)
  )

  return createSelector(
    [transactionsSelector, (state: AppState, account: string | undefined) => account],
    (txs, account) => {
      if (account) {
        const normalizedAccount = account.toLowerCase()

        return txs.filter(tx => tx.initiator.toLowerCase() === normalizedAccount)
      }
      return []
    }
  )
}

const createSelectBridgeTransactionsSummary = (
  bridgeId: ConnextList,
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
) => {
  return createSelector([selectOwnedTransactions], transactions => {
    const pairedTransactions: TransactionsSummary = {}

    transactions.forEach(transaction => {
      if (pairedTransactions[transaction.transactionId]) return

      const partnerTransaction = transactions.find(
        partner =>
          partner.transactionId.toLowerCase() === transaction.transactionId.toLowerCase() &&
          partner.chainId !== transaction.chainId
      )

      const sendingTransaction = transaction.sendingChainId === transaction.chainId ? transaction : partnerTransaction

      const receivingTransaction =
        transaction.receivingChainId === transaction.chainId ? transaction : partnerTransaction

      const token = CONNEXT_TOKENS.find(
        tx =>
          tx.contracts[transaction.sendingChainId] &&
          tx.contracts[transaction.sendingChainId].contract_address.toLowerCase() ===
            transaction.sendingAssetId.toLowerCase()
      )

      const summary: BridgeTransactionSummary = {
        assetName: token?.symbol ?? '',
        bridgeId,
        fromChainId: Number(transaction.sendingChainId),
        toChainId: Number(transaction.receivingChainId),
        log: [
          { chainId: Number(sendingTransaction?.chainId), txHash: sendingTransaction?.prepareTransactionHash ?? '' },
        ],
        txHash: sendingTransaction?.prepareTransactionHash ?? '',
        fromValue: formatUnits(
          sendingTransaction?.amount ?? 0,
          token?.contracts[sendingTransaction?.chainId ?? '1'].contract_decimals
        ),
        toValue: formatUnits(
          receivingTransaction?.amount ?? 0,
          token?.contracts[receivingTransaction?.chainId ?? '1'].contract_decimals
        ),
        assetAddressL1: transaction.sendingAssetId,
        assetAddressL2: transaction.receivingAssetId,
        status: BridgeTransactionStatus.PENDING,
        timestampResolved: Number(sendingTransaction?.preparedTimestamp) * 1000,
        pendingReason: 'Transaction has not been confirmed yet',
      }

      if (partnerTransaction) {
        if (
          partnerTransaction.status === ConnextTransactionStatus.PREPARED &&
          transaction.status === ConnextTransactionStatus.PREPARED
        ) {
          summary.status = BridgeTransactionStatus.REDEEM
          summary.timestampResolved = undefined
        }
        if (
          partnerTransaction.status === ConnextTransactionStatus.FULFILLED &&
          transaction.status === ConnextTransactionStatus.FULFILLED
        ) {
          summary.status = BridgeTransactionStatus.CLAIMED

          summary.log.push({
            chainId: Number(receivingTransaction?.chainId),
            txHash: receivingTransaction?.fulfillTransactionHash ?? '',
          })

          summary.timestampResolved = Number(receivingTransaction?.fulfillTimestamp) * 1000
        }
        if (
          partnerTransaction.status === ConnextTransactionStatus.PENDING ||
          transaction.status === ConnextTransactionStatus.PENDING
        ) {
          summary.status = BridgeTransactionStatus.PENDING
        }
        if (
          partnerTransaction.status === ConnextTransactionStatus.CANCELLED ||
          transaction.status === ConnextTransactionStatus.CANCELLED
        ) {
          summary.status = BridgeTransactionStatus.CANCELLED
          summary.log.push({
            chainId: Number(receivingTransaction?.chainId),
            txHash: receivingTransaction?.cancelTransactionHash ?? '',
          })
          summary.timestampResolved = Number(receivingTransaction?.cancelTimestamp) * 1000
        }
      }

      pairedTransactions[transaction.transactionId] = summary
    })
    return Object.values(pairedTransactions)
  })
}

const createSelectPendingTransactions = (
  bridgeId: ConnextList,
  bridgeTransactionSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
) =>
  createSelector([bridgeTransactionSummary], txs =>
    txs.filter(({ status }) => status === BridgeTransactionStatus.PENDING)
  )

const createSelectTransaction = (bridgeId: ConnextList) =>
  createSelector(
    [(state: AppState) => state.ecoBridge[bridgeId].transactions, (state: AppState, txHash: string) => txHash],
    (txs, txHash) => connextTransactionsAdapter.getSelectors().selectById(txs, txHash)
  )

const createSelectAllTransactions = (bridgeId: ConnextList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].transactions], txs =>
    connextTransactionsAdapter.getSelectors().selectAll(txs)
  )

export interface ConnextBridgeSelectors {
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectTransaction: ReturnType<typeof createSelectTransaction>
  selectAllTransactions: ReturnType<typeof createSelectAllTransactions>
}

export const connextSelectorsFactory = (connextBridges: ConnextList[]) => {
  return connextBridges.reduce((total, bridgeId) => {
    const selectBridgingDetails = createSelectBridgingDetails(bridgeId)
    const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
    const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)
    const selectPendingTransactions = createSelectPendingTransactions(bridgeId, selectBridgeTransactionsSummary)
    const selectTransaction = createSelectTransaction(bridgeId)
    const selectAllTransactions = createSelectAllTransactions(bridgeId)

    const selectors = {
      selectBridgingDetails,
      selectOwnedTransactions,
      selectBridgeTransactionsSummary,
      selectPendingTransactions,
      selectTransaction,
      selectAllTransactions,
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in ConnextList]: ConnextBridgeSelectors })
}

export const connextSelectors = connextSelectorsFactory(['connext'])
