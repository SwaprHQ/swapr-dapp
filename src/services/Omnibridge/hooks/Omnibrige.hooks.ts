import { useCallback, useEffect, useMemo } from 'react'
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
import { ChainId, Currency } from '@swapr/sdk'
import { omnibridgeUIActions } from '../store/UI.reducer'
import { currencyId } from '../../../utils/currencyId'
import { useCurrency } from '../../../hooks/Tokens'
import { tryParseAmount } from '../../../state/swap/hooks'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { BridgeTxsFilter } from '../Omnibridge.types'

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
  const showAvailableBridges = useSelector((state: AppState) => state.omnibridge.UI.showAvailableBridges)

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

export function useBridgeActionHandlers(): {
  onCurrencySelection: (currency: Currency | string) => void
  onUserInput: (typedValue: string) => void
  onFromNetworkChange: (chainId: ChainId) => void
  onToNetworkChange: (chainId: ChainId) => void
  onSwapBridgeNetworks: () => void
} {
  const dispatch = useDispatch()

  const fromChainId = useSelector((state: AppState) => state.omnibridge.UI.from.chainId)
  const toChainId = useSelector((state: AppState) => state.omnibridge.UI.to.chainId)

  const onFromNetworkChange = useCallback(
    (chainId: ChainId) => {
      if (chainId === toChainId) {
        dispatch(omnibridgeUIActions.swapBridgeChains())
        return
      }
      dispatch(omnibridgeUIActions.setFrom({ chainId }))
    },
    [dispatch, toChainId]
  )

  const onToNetworkChange = useCallback(
    (chainId: ChainId) => {
      if (chainId === fromChainId) {
        dispatch(omnibridgeUIActions.swapBridgeChains())
        return
      }
      dispatch(omnibridgeUIActions.setTo({ chainId }))
    },
    [dispatch, fromChainId]
  )

  const onSwapBridgeNetworks = useCallback(() => {
    dispatch(omnibridgeUIActions.swapBridgeChains())
  }, [dispatch])

  const onCurrencySelection = useCallback(
    (currency: Currency | string) => {
      dispatch(
        omnibridgeUIActions.setFrom({
          address: currency instanceof Currency ? currencyId(currency) : currency,
          decimals: currency instanceof Currency ? currency.decimals : undefined
        })
      )
      // dispatch(omnibridgeUIActions.setTo({ address: currency instanceof Currency ? currencyId(currency) : currency }))
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (typedValue: string) => {
      dispatch(omnibridgeUIActions.setFrom({ value: typedValue }))
      // dispatch(omnibridgeUIActions.setTo({ value: '' }))
      dispatch(commonActions.setActiveBridge(undefined))
    },
    [dispatch]
  )

  return {
    onCurrencySelection,
    onUserInput,
    onFromNetworkChange,
    onToNetworkChange,
    onSwapBridgeNetworks
  }
}

export const useBridgeInfo = () => {
  const { account, chainId } = useActiveWeb3React()

  const fromNetwork = useSelector((state: AppState) => state.omnibridge.UI.from)
  const toChainId = useSelector((state: AppState) => state.omnibridge.UI.to.chainId)

  const { address: currencyId, value: typedValue, chainId: fromChainId } = fromNetwork

  const bridgeCurrency = useCurrency(currencyId)
  const parsedAmount = useMemo(() => tryParseAmount(typedValue, bridgeCurrency ?? undefined, chainId), [
    bridgeCurrency,
    chainId,
    typedValue
  ])

  const [currencyBalance] = useCurrencyBalances(account ?? undefined, [bridgeCurrency ?? undefined])

  const isBalanceSufficient = useMemo(
    () => currencyBalance && parsedAmount && currencyBalance.greaterThan(parsedAmount),
    [currencyBalance, parsedAmount]
  )

  return {
    isBalanceSufficient,
    currencyId,
    bridgeCurrency,
    currencyBalance,
    parsedAmount,
    typedValue,
    fromChainId,
    toChainId
  }
}

export const useBridgeTxsFilter = (): [BridgeTxsFilter, (filter: BridgeTxsFilter) => void] => {
  const dispatch = useDispatch()
  const filter = useSelector((state: AppState) => state.omnibridge.UI.filter)
  const setFilter = (filter: BridgeTxsFilter) => {
    dispatch(omnibridgeUIActions.setBridgeTxsFilter(filter))
  }

  return [filter, setFilter]
}
