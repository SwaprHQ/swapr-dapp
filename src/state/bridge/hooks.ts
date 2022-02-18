import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ChainId, Currency } from '@swapr/sdk'

import { AppDispatch, AppState } from '../index'
import {
  selectCurrency,
  typeInput,
  setFromBridgeNetwork,
  setToBridgeNetwork,
  swapBridgeNetworks,
  setBridgeTxsFilter
} from './actions'
import { bridgeTxsFilterSelector } from './selectors'
import { BridgeTxsFilter } from './reducer'

import { tryParseAmount } from '../swap/hooks'
import { useCurrency } from '../../hooks/Tokens'
import { useActiveWeb3React } from '../../hooks'
import { useCurrencyBalances } from '../wallet/hooks'

import { currencyId } from '../../utils/currencyId'
import { getChainPair } from '../../utils/arbitrum'
import { omnibridgeUIActions } from '../../services/Omnibridge/store/UI.reducer'

export function useBridgeState(): AppState['bridge'] {
  return useSelector<AppState, AppState['bridge']>(state => state.bridge)
}

export function useBridgeActionHandlers(): {
  onCurrencySelection: (currency: Currency | string) => void
  onUserInput: (typedValue: string) => void
  onFromNetworkChange: (chainId: ChainId) => void
  onToNetworkChange: (chainId: ChainId) => void
  onSwapBridgeNetworks: () => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const { fromNetwork, toNetwork } = useBridgeState()

  const onFromNetworkChange = useCallback(
    (chainId: ChainId) => {
      const { partnerChainId } = getChainPair(chainId)
      if (chainId === toNetwork.chainId) {
        //TODO: remove old redux
        dispatch(swapBridgeNetworks())
        dispatch(omnibridgeUIActions.swapBridgeChains())
        return
      }
      dispatch(
        setFromBridgeNetwork({
          chainId: chainId
        })
      )
      dispatch(
        setToBridgeNetwork({
          chainId: partnerChainId
        })
      )
      // new UI reducer
      dispatch(omnibridgeUIActions.setFrom({ chainId: chainId }))
      dispatch(omnibridgeUIActions.setTo({ chainId: partnerChainId }))
    },
    [dispatch, toNetwork.chainId]
  )

  const onToNetworkChange = useCallback(
    (chainId: ChainId) => {
      const { partnerChainId } = getChainPair(chainId)

      if (chainId === fromNetwork.chainId) {
        dispatch(swapBridgeNetworks())
        dispatch(omnibridgeUIActions.swapBridgeChains())
        return
      }
      dispatch(
        setToBridgeNetwork({
          chainId: chainId
        })
      )
      dispatch(
        setFromBridgeNetwork({
          chainId: partnerChainId
        })
      )
      // new UI reducer
      dispatch(omnibridgeUIActions.setFrom({ chainId: chainId }))
      dispatch(omnibridgeUIActions.setTo({ chainId: partnerChainId }))
    },
    [dispatch, fromNetwork.chainId]
  )

  const onSwapBridgeNetworks = useCallback(() => {
    dispatch(swapBridgeNetworks())
    dispatch(omnibridgeUIActions.swapBridgeChains())
  }, [dispatch])

  const onCurrencySelection = useCallback(
    (currency: Currency | string) => {
      dispatch(
        selectCurrency({
          currencyId: currency instanceof Currency ? currencyId(currency) : currency
        })
      )
      dispatch(omnibridgeUIActions.setFrom({ address: currency instanceof Currency ? currencyId(currency) : currency }))
      dispatch(omnibridgeUIActions.setTo({ address: currency instanceof Currency ? currencyId(currency) : currency }))
    },
    [dispatch]
  )

  const onUserInput = useCallback(
    (typedValue: string) => {
      dispatch(typeInput({ typedValue }))
      dispatch(omnibridgeUIActions.setFrom({ value: typedValue }))
      dispatch(omnibridgeUIActions.setTo({ value: typedValue }))
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
  const { typedValue, currencyId, fromNetwork, toNetwork } = useBridgeState()

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
    fromNetwork,
    toNetwork
  }
}

export const useBridgeTxsFilter = (): [BridgeTxsFilter, (filter: BridgeTxsFilter) => void] => {
  const dispatch = useDispatch()
  const filter = useSelector(bridgeTxsFilterSelector)
  const setFilter = (filter: BridgeTxsFilter) => {
    dispatch(setBridgeTxsFilter(filter))
    dispatch(omnibridgeUIActions.setBridgeTxsFilter(filter))
  }

  return [filter, setFilter]
}
