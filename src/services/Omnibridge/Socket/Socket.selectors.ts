import { createSelector } from 'reselect'
import { AppState } from '../../../state'
import { SocketList } from '../Omnibridge.types'

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

//TODO selector for txs

export interface SocketBridgeSelectors {
  selectBridgingDetails: ReturnType<typeof createSelectBridgingDetails>
  selectRoutes: ReturnType<typeof createSelectRoutes>
  selectApprovalData: ReturnType<typeof createSelectApprovalData>
  selectTxBridgingData: ReturnType<typeof createSelectTxBridgingData>
}
export const socketSelectorsFactory = (socketBridges: SocketList[]) => {
  return socketBridges.reduce((total, bridgeId) => {
    const selectBridgingDetails = createSelectBridgingDetails(bridgeId)
    const selectRoutes = createSelectRoutes(bridgeId)
    const selectApprovalData = createSelectApprovalData(bridgeId)
    const selectTxBridgingData = createSelectTxBridgingData(bridgeId)

    const selectors = {
      selectBridgingDetails,
      selectRoutes,
      selectApprovalData,
      selectTxBridgingData
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in SocketList]: SocketBridgeSelectors })
}

export const socketSelectors = socketSelectorsFactory(['socket'])
