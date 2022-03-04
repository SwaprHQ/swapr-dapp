import { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from '../../../state'
import { useActiveWeb3React } from '../../../hooks'
import {
  selectAllTokensPerChain,
  selectAllActiveTokens,
  selectAllLists,
  selectListsLoading,
  selectSupportedBridgesForUI
} from '../store/Omnibridge.selectors'
import { commonActions } from '../store/Common.reducer'
import { useOmnibridge } from '../OmnibridgeProvider'

export const useAllBridgeTokens = () => {
  const { chainId } = useActiveWeb3React()
  const tokens = useSelector((state: AppState) => selectAllTokensPerChain(state, chainId ?? 0))

  return tokens
}

export const useBridgeActiveTokenMap = () => {
  const tokenMap = useSelector(selectAllActiveTokens)

  return tokenMap
}

export const useAllBridgeLists = () => {
  const allLists = useSelector(selectAllLists)

  return allLists
}

export const useActiveListsHandlers = () => {
  const dispatch = useDispatch()
  const activeLists = useSelector((state: AppState) => state.omnibridge.common.activeLists)

  return {
    activateList: useCallback((listId: string) => dispatch(commonActions.activateLists([listId])), [dispatch]),
    deactivateList: useCallback((listId: string) => dispatch(commonActions.deactivateLists([listId])), [dispatch]),
    isListActive: useCallback((listId: string) => activeLists.includes(listId), [activeLists])
  }
}

export const useBridgeListsLoadingStatus = () => {
  const isLoading = useSelector(selectListsLoading)

  return isLoading
}

export const useBridgeFetchDynamicLists = () => {
  const omnibridge = useOmnibridge()
  const { from, to } = useSelector((state: AppState) => state.omnibridge.UI)

  useEffect(() => {
    if (from.chainId && to.chainId) {
      omnibridge.fetchDynamicLists()
    }
  }, [from.chainId, omnibridge, to.chainId])
}

export const useShowAvailableBridges = () => {
  const { showAvailableBridges } = useSelector((state: AppState) => state.omnibridge.UI)

  return showAvailableBridges
}
export const useAvailableBridges = () => {
  const availableBridges = useSelector(selectSupportedBridgesForUI)

  return availableBridges.filter(bridge => bridge.status !== 'failed')
}
export const useActiveBridge = () => {
  const activeBridge = useSelector((state: AppState) => state.omnibridge.common.activeBridge)

  return activeBridge
}
