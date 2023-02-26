import { createSelector } from 'reselect'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { LifiList } from '../EcoBridge.types'
import { LifiTransactionStatus, LifiTxStatus, LIFI_PENDING_REASONS } from './Lifi.types'

const createSelectRoute = (bridgeId: LifiList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].route], route => route)

const createSelectApprovalData = (bridgeId: LifiList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].approvalData], approvalData => approvalData)

const createSelectTxBridgingData = (bridgeId: LifiList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].txBridgingData], txBridgingData => txBridgingData)

const createSelectOwnedTransactions = (bridgeId: LifiList) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].transactions,
      (_state: AppState, account: string | undefined) => account,
    ],
    (txs, account) => {
      let ownedTxs: LifiTransactionStatus[] = []
      if (account) {
        ownedTxs = txs.reduce<LifiTransactionStatus[]>((filteredTxs, tx) => {
          if (account.toLowerCase() === tx.account.toLowerCase()) {
            filteredTxs.push(tx)
          }

          return filteredTxs
        }, [])
      }

      return ownedTxs
    }
  )

const createSelectPendingTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector(selectOwnedTxs, ownedTxs => {
    const pendingTxs = ownedTxs.filter(
      ({ statusResponse }) => statusResponse.status !== 'FAILED' && !statusResponse.receiving?.txHash
    )

    return pendingTxs
  })

const createSelectFailedTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector(selectOwnedTxs, ownedTxs => {
    const failedTxs = ownedTxs.filter(
      ({ statusResponse }) => statusResponse.status === 'FAILED' && !statusResponse.receiving?.txHash
    )

    return failedTxs
  })

const createSelectBridgeTransactionsSummary = (
  bridgeId: LifiList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs], txs => {
    const summaries = txs.map(({ statusResponse, timeResolved }) => {
      const pendingReason =
        statusResponse.status === LifiTxStatus.PENDING && statusResponse.substatus
          ? LIFI_PENDING_REASONS[statusResponse.substatus]!
          : 'We cannot determine the status of the transfer.'

      const fromValue = Number(statusResponse.sending.amount).toString()
      const toValue = Number(statusResponse.receiving?.amount ?? 0).toString()

      const summary: BridgeTransactionSummary = {
        assetName: statusResponse.sending.token?.name!,
        assetAddressL1: statusResponse.sending.token?.address,
        assetAddressL2: statusResponse.receiving?.token?.address,
        // @ts-ignore ChainId type missmatch.'
        fromChainId: statusResponse.sending.chainId!,
        // @ts-ignore ChainId type missmatch.'
        toChainId: statusResponse.receiving?.chainId!,
        status:
          statusResponse.status === LifiTxStatus.DONE
            ? BridgeTransactionStatus.CONFIRMED
            : statusResponse.status === LifiTxStatus.FAILED || statusResponse.status === LifiTxStatus.INVALID
            ? BridgeTransactionStatus.FAILED
            : BridgeTransactionStatus.PENDING,
        fromValue,
        toValue,
        txHash: statusResponse.receiving?.txHash!,
        pendingReason,
        // TODO: need to fix this
        timestampResolved: timeResolved,
        log: [
          {
            // @ts-ignore
            chainId: statusResponse.sending.chainId,
            txHash: statusResponse.sending.txHash,
            fromTxnLink: statusResponse.sending.txLink,
          },
        ],
        bridgeId,
      }

      if (statusResponse.receiving?.txHash) {
        summary.log.push({
          // @ts-ignore
          chainId: statusResponse.receiving.chainId,
          txHash: statusResponse.receiving.txHash,
          toTxnLink: statusResponse.receiving.txLink,
        })
      }

      return summary
    })

    return summaries
  })

export interface LifiBridgeSelectors {
  selectRoute: ReturnType<typeof createSelectRoute>
  selectApprovalData: ReturnType<typeof createSelectApprovalData>
  selectTxBridgingData: ReturnType<typeof createSelectTxBridgingData>
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectFailedTransactions: ReturnType<typeof createSelectFailedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
}

export const lifiSelectorsFactory = (lifiBridges: LifiList[]) => {
  return lifiBridges.reduce((total, bridgeId) => {
    const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
    const selectRoute = createSelectRoute(bridgeId)
    const selectApprovalData = createSelectApprovalData(bridgeId)
    const selectTxBridgingData = createSelectTxBridgingData(bridgeId)
    const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)
    const selectFailedTransactions = createSelectFailedTransactions(selectOwnedTransactions)
    const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)

    const selectors = {
      selectRoute,
      selectApprovalData,
      selectTxBridgingData,
      selectOwnedTransactions,
      selectFailedTransactions,
      selectPendingTransactions,
      selectBridgeTransactionsSummary,
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in LifiList]: LifiBridgeSelectors })
}

export const lifiSelectors = lifiSelectorsFactory(['lifi'])
