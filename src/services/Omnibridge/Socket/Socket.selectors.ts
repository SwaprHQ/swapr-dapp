import { createSelector } from 'reselect'
import { AppState } from '../../../state'
import { SocketList } from '../Omnibridge.types'

const createSelectRoute = (bridgeId: SocketList) =>
  createSelector([(state: AppState) => state.omnibridge[bridgeId].routes], route => route)

export interface SocketBridgeSelectors {
  selectRoute: ReturnType<typeof createSelectRoute>
}
export const socketSelectorsFactory = (socketBridges: SocketList[]) => {
  return socketBridges.reduce((total, bridgeId) => {
    const selectRoute = createSelectRoute(bridgeId)

    const selectors = {
      selectRoute
    }

    total[bridgeId] = selectors
    return total
  }, {} as { [k in SocketList]: SocketBridgeSelectors })
}

export const socketSelectors = socketSelectorsFactory(['socket'])
