import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { normalizeInputValue } from '../../../utils'
import { ArbitrumPendingReasons } from '../Arbitrum/ArbitrumBridge.types'
import { BridgeIds, XdaiBridgeIdList } from '../EcoBridge.types'

import { xdaiBridgeTransactionAdapter } from './XdaiBridge.adapter'

const createSelectOwnedTransactions = (bridgeId: XdaiBridgeIdList) => {
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
  bridgeId: XdaiBridgeIdList,
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
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
}

export const xdaiSelectorsFactory = (xdaiBridges: XdaiBridgeIdList[]) => {
  return xdaiBridges.reduce((total, bridgeId) => {
    const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
    const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)
    const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)

    const selectors = {
      selectOwnedTransactions,
      selectBridgeTransactionsSummary,
      selectPendingTransactions,
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in XdaiBridgeIdList]: XdaiBridgeSelectors })
}

export const xdaiSelectors = xdaiSelectorsFactory([BridgeIds.XDAI])
