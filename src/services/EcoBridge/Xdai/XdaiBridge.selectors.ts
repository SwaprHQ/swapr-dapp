import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { normalizeInputValue } from '../../../utils'
import { ArbitrumPendingReasons } from '../Arbitrum/ArbitrumBridge.types'
import { XdaiBridgeList } from '../EcoBridge.types'
import { xdaiBridgeTransactionAdapter } from './XdaiBridge.adapter'

const createSelectBridgingDetails = (bridgeId: XdaiBridgeList) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetails,
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsStatus,
    ],
    (details, loading) => {
      return {
        bridgeId,
        details,
        loading,
        errorMessage: undefined,
      }
    }
  )

const createSelectOwnedTransactions = (bridgeId: XdaiBridgeList) => {
  const transactionsSelector = createSelector(
    [(state: AppState) => state.ecoBridge[bridgeId].transactions],
    transactions => xdaiBridgeTransactionAdapter.getSelectors().selectAll(transactions)
  )

  return createSelector(
    [transactionsSelector, (state: AppState, account: string | undefined) => account],
    (transactions, account) => {
      if (account) {
        const normalizedAccount = account.toLowerCase()

        return transactions.filter(tx => tx.sender.toLowerCase() === normalizedAccount)
      }
      return []
    }
  )
}

const createSelectBridgeTransactionsSummary = (
  bridgeId: XdaiBridgeList,
  ownedTransactions: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([ownedTransactions], transactions => {
    const summaries = transactions.map(tx => {
      const {
        txHash,
        assetName,
        value,
        timestampResolved,
        assetAddressL1,
        assetAddressL2,
        fromChainId,
        toChainId,
        status,
        partnerTransactionHash,
      } = tx

      const normalizedValue = Number(normalizeInputValue(value)).toFixed(2)

      const summary: BridgeTransactionSummary = {
        txHash,
        assetName,
        fromValue: normalizedValue,
        toValue: normalizedValue, // No fees for xDai Bridge
        assetAddressL1,
        assetAddressL2,
        fromChainId,
        toChainId,
        log: [{ txHash, chainId: fromChainId }],
        status,
        bridgeId,
        pendingReason: status === BridgeTransactionStatus.PENDING ? ArbitrumPendingReasons.TX_UNCONFIRMED : undefined,
        timestampResolved:
          status === BridgeTransactionStatus.CONFIRMED || status === BridgeTransactionStatus.CLAIMED
            ? timestampResolved
            : undefined,
      }

      if (
        partnerTransactionHash &&
        (status === BridgeTransactionStatus.CLAIMED || status === BridgeTransactionStatus.CONFIRMED)
      ) {
        summary.log.push({ txHash: partnerTransactionHash, chainId: toChainId })
      }

      return summary
    })

    return summaries
  })

const createSelectPendingTransactions = (ownedTransactions: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector([ownedTransactions], transactions => {
    return transactions.filter(tx => tx.status === BridgeTransactionStatus.PENDING)
  })

export interface XdaiBridgeSelectors {
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
}

export const xdaiSelectorsFactory = (xdaiBridges: XdaiBridgeList[]) => {
  return xdaiBridges.reduce((total, bridgeId) => {
    const selectBridgingDetails = createSelectBridgingDetails(bridgeId)
    const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
    const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)
    const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)

    const selectors = {
      selectBridgingDetails,
      selectOwnedTransactions,
      selectBridgeTransactionsSummary,
      selectPendingTransactions,
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in XdaiBridgeList]: XdaiBridgeSelectors })
}

export const xdaiSelectors = xdaiSelectorsFactory(['xdai'])
