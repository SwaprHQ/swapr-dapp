import { createSelector } from 'reselect'
import { AppState } from '../../../state'
import { BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'
import { PendingReasons } from '../../../utils/arbitrum'
import { BridgeTxsFilter, SocketList } from '../Omnibridge.types'
import { SocketTx } from './Socket.types'

const createSelectBridgingDetails = (bridgeId: SocketList) =>
  createSelector(
    [
      (state: AppState) => state.omnibridge[bridgeId].bridgingDetails,
      (state: AppState) => state.omnibridge[bridgeId].bridgingDetailsStatus,
      (state: AppState) => state.omnibridge[bridgeId].bridgingDetailsErrorMessage
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

const createSelectRoutes = (bridgeId: SocketList) =>
  createSelector([(state: AppState) => state.omnibridge[bridgeId].routes], routes => routes)

const createSelectApprovalData = (bridgeId: SocketList) =>
  createSelector([(state: AppState) => state.omnibridge[bridgeId].approvalData], approvalData => approvalData)

const createSelectTxBridgingData = (bridgeId: SocketList) =>
  createSelector([(state: AppState) => state.omnibridge[bridgeId].txBridgingData], txBridgingData => txBridgingData)

const createSelectOwnedTxs = (bridgeId: SocketList) =>
  createSelector(
    [
      (state: AppState) => state.omnibridge[bridgeId].transactions,
      (state: AppState, account: string | undefined) => account
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

const createSelectPendingTxs = (selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>) =>
  createSelector(selectOwnedTxs, ownedTxs => {
    const pendingTxs = ownedTxs.filter(tx => tx.status === 'pending' || !tx.partnerTxHash)

    return pendingTxs
  })

const createSelectBridgeTxsSummary = (bridgeId: SocketList, selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>) =>
  createSelector([selectOwnedTxs, (state: AppState) => state.omnibridge.UI.filter], (txs, txsFilter) => {
    const summaries = txs.map(tx => {
      const summary: BridgeTransactionSummary = {
        assetName: tx.assetName,
        assetAddressL1: '', // used by collect
        assetAddressL2: '', // used by collect
        fromChainId: tx.fromChainId,
        toChainId: tx.toChainId,
        status: tx.status === 'error' ? 'failed' : tx.status === 'pending' ? 'loading' : 'confirmed',
        value: tx.value,
        txHash: tx.txHash,
        pendingReason: tx.status === 'pending' ? PendingReasons.TX_UNCONFIRMED : undefined,
        timestampResolved: tx.timestampResolved,
        log: [
          {
            chainId: tx.fromChainId,
            fromChainId: tx.fromChainId,
            status: tx.status === 'error' ? 'failed' : tx.status === 'pending' ? 'loading' : 'confirmed',
            txHash: tx.txHash,
            type: 'deposit',
            toChainId: tx.toChainId
          }
        ],
        bridgeId
      }
      return summary
    })

    switch (txsFilter) {
      case BridgeTxsFilter.COLLECTABLE:
        return summaries.filter(summary => summary.status === 'redeem')
      case BridgeTxsFilter.RECENT:
        const passed24h = new Date().getTime() - 1000 * 60 * 60 * 24
        return summaries.filter(summary => {
          if (!summary.timestampResolved) return true
          return summary.timestampResolved >= passed24h
        })
      default:
        return summaries
    }
  })

export interface SocketBridgeSelectors {
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
  selectRoutes: ReturnType<typeof createSelectRoutes>
  selectApprovalData: ReturnType<typeof createSelectApprovalData>
  selectTxBridgingData: ReturnType<typeof createSelectTxBridgingData>
  selectOwnedTxs: ReturnType<typeof createSelectOwnedTxs>
  selectPendingTxs: ReturnType<typeof createSelectPendingTxs>
  selectBridgeTxsSummary: ReturnType<typeof createSelectBridgeTxsSummary>
}
export const socketSelectorsFactory = (socketBridges: SocketList[]) => {
  return socketBridges.reduce((total, bridgeId) => {
    const selectOwnedTxs = createSelectOwnedTxs(bridgeId)
    const selectBridgingDetails = createSelectBridgingDetails(bridgeId)
    const selectRoutes = createSelectRoutes(bridgeId)
    const selectApprovalData = createSelectApprovalData(bridgeId)
    const selectTxBridgingData = createSelectTxBridgingData(bridgeId)
    const selectPendingTxs = createSelectPendingTxs(selectOwnedTxs)
    const selectBridgeTxsSummary = createSelectBridgeTxsSummary(bridgeId, selectOwnedTxs)

    const selectors = {
      selectBridgingDetails,
      selectRoutes,
      selectApprovalData,
      selectTxBridgingData,
      selectOwnedTxs,
      selectPendingTxs,
      selectBridgeTxsSummary
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in SocketList]: SocketBridgeSelectors })
}

export const socketSelectors = socketSelectorsFactory(['socket'])
