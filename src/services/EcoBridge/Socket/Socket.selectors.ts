import { createSelector } from 'reselect'

import { AppState } from '../../../state'
import { BridgeTransactionStatus, BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { BridgeIds, SocketIdList } from '../EcoBridge.types'

import { SOCKET_PENDING_REASONS, SocketTx, SocketTxStatus } from './Socket.types'

const createSelectRoutes = (bridgeId: SocketIdList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].routes], routes => routes)

const createSelectApprovalData = (bridgeId: SocketIdList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].approvalData], approvalData => approvalData)

const createSelectTxBridgingData = (bridgeId: SocketIdList) =>
  createSelector([(state: AppState) => state.ecoBridge[bridgeId].txBridgingData], txBridgingData => txBridgingData)

const createSelectOwnedTransactions = (bridgeId: SocketIdList) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].transactions,
      (state: AppState, account: string | undefined) => account,
    ],
    (txs, account) => {
      let ownedTxs: SocketTx[] = []

      if (account) {
        ownedTxs = txs.reduce<SocketTx[]>((filteredTxs, tx) => {
          if (account.toLocaleLowerCase() === tx.sender.toLocaleLowerCase()) {
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
    const pendingTxs = ownedTxs.filter(tx => tx.status !== SocketTxStatus.ERROR && !tx.partnerTxHash)

    return pendingTxs
  })

const createSelectFailedTransactions = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>) =>
  createSelector(selectOwnedTxs, ownedTxs => {
    const failedTxs = ownedTxs.filter(tx => tx.status === SocketTxStatus.ERROR && !tx.partnerTxHash)

    return failedTxs
  })

const createSelectBridgeTransactionsSummary = (
  bridgeId: SocketIdList,
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTransactions>
) =>
  createSelector([selectOwnedTxs], txs => {
    const summaries = txs.map(tx => {
      const pendingReason =
        tx.status === SocketTxStatus.FROM_PENDING
          ? SOCKET_PENDING_REASONS.FROM_PENDING
          : tx.status === SocketTxStatus.TO_PENDING
          ? SOCKET_PENDING_REASONS.TO_PENDING
          : undefined

      const fromValue = Number(tx.fromValue).toString()
      const toValue = Number(tx.toValue ?? 0).toString()

      const summary: BridgeTransactionSummary = {
        assetName: tx.assetName,
        assetAddressL1: tx.assetAddressL1,
        assetAddressL2: tx.assetAddressL2,
        fromChainId: tx.fromChainId,
        toChainId: tx.toChainId,
        status: tx.partnerTxHash
          ? BridgeTransactionStatus.CONFIRMED
          : tx.status === SocketTxStatus.ERROR
          ? BridgeTransactionStatus.FAILED
          : BridgeTransactionStatus.PENDING,
        fromValue,
        toValue,
        txHash: tx.txHash,
        pendingReason,
        timestampResolved: tx.timestampResolved,
        log: [
          {
            chainId: tx.fromChainId,
            txHash: tx.txHash,
          },
        ],
        bridgeId,
      }

      if (tx.partnerTxHash) {
        summary.log.push({
          chainId: tx.toChainId,
          txHash: tx.partnerTxHash,
        })
      }

      return summary
    })

    return summaries
  })

export interface SocketBridgeSelectors {
  selectRoutes: ReturnType<typeof createSelectRoutes>
  selectApprovalData: ReturnType<typeof createSelectApprovalData>
  selectTxBridgingData: ReturnType<typeof createSelectTxBridgingData>
  selectOwnedTransactions: ReturnType<typeof createSelectOwnedTransactions>
  selectPendingTransactions: ReturnType<typeof createSelectPendingTransactions>
  selectFailedTransactions: ReturnType<typeof createSelectFailedTransactions>
  selectBridgeTransactionsSummary: ReturnType<typeof createSelectBridgeTransactionsSummary>
}
export const socketSelectorsFactory = (socketBridges: SocketIdList[]) => {
  return socketBridges.reduce((total, bridgeId) => {
    const selectOwnedTransactions = createSelectOwnedTransactions(bridgeId)
    const selectRoutes = createSelectRoutes(bridgeId)
    const selectApprovalData = createSelectApprovalData(bridgeId)
    const selectTxBridgingData = createSelectTxBridgingData(bridgeId)
    const selectPendingTransactions = createSelectPendingTransactions(selectOwnedTransactions)
    const selectFailedTransactions = createSelectFailedTransactions(selectOwnedTransactions)
    const selectBridgeTransactionsSummary = createSelectBridgeTransactionsSummary(bridgeId, selectOwnedTransactions)

    const selectors = {
      selectRoutes,
      selectApprovalData,
      selectTxBridgingData,
      selectOwnedTransactions,
      selectFailedTransactions,
      selectPendingTransactions,
      selectBridgeTransactionsSummary,
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in SocketIdList]: SocketBridgeSelectors })
}

export const socketSelectors = socketSelectorsFactory([BridgeIds.SOCKET])
