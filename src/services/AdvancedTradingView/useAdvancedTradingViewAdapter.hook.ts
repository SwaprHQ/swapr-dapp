import { ChainId, Currency, WETH, WXDAI } from '@swapr/sdk'

import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { useToken } from '../../hooks/Tokens'
import store, { AppState } from '../../state'
import { useSwapState } from '../../state/swap/hooks'
import { adapters } from './adapters/adapters.config'
import { AdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { AdapterAmountToFetch } from './advancedTradingView.types'

const WrappedNativeCurrencyAddress = {
  [ChainId.MAINNET]: WETH[ChainId.MAINNET].address,
  [ChainId.ARBITRUM_ONE]: WETH[ChainId.ARBITRUM_ONE].address,
  [ChainId.GNOSIS]: WXDAI[ChainId.GNOSIS].address,
}

const getTokenAddress = (chainId: ChainId, tokenAddress: string | undefined) =>
  tokenAddress === Currency.getNative(chainId).symbol
    ? WrappedNativeCurrencyAddress[chainId as ChainId.MAINNET | ChainId.ARBITRUM_ONE | ChainId.GNOSIS]
    : tokenAddress

export const useAdvancedTradingViewAdapter = () => {
  const { chainId } = useActiveWeb3React()
  const [advancedTradingViewAdapter, setAdvancedTradingViewAdapter] = useState<AdvancedTradingViewAdapter<AppState>>()
  const [symbol, setSymbol] = useState<string>()
  const previousTokens = useRef<{ inputTokenAddress?: string; outputTokenAddress?: string }>({
    inputTokenAddress: undefined,
    outputTokenAddress: undefined,
  })
  const [isFirstLoadingFetchTrades, setFirstLoadingFetchTrades] = useState(true)
  const [isFirstLoadingFetchActivity, setFirstLoadingFetchActivity] = useState(true)

  const dispatch = useDispatch()

  const {
    INPUT: { currencyId: inputCurrencyId },
    OUTPUT: { currencyId: outputCurrencyId },
  } = useSwapState()

  const [inputToken, outputToken] = [
    useToken(getTokenAddress(chainId as ChainId, inputCurrencyId)),
    useToken(getTokenAddress(chainId as ChainId, outputCurrencyId)),
  ]

  useEffect(() => {
    if (!advancedTradingViewAdapter && chainId) {
      const tradesHistoryAdapter = new AdvancedTradingViewAdapter<AppState>({
        adapters,
        chainId,
        store,
      })
      setAdvancedTradingViewAdapter(tradesHistoryAdapter)
    }

    if (advancedTradingViewAdapter) {
      if (advancedTradingViewAdapter.isInitialized && chainId) {
        advancedTradingViewAdapter.updateActiveChainId(chainId)
      } else {
        advancedTradingViewAdapter.init()
      }
    }
  }, [chainId, advancedTradingViewAdapter])

  const fetchTrades = async () => {
    if (!advancedTradingViewAdapter || !inputToken || !outputToken) return
    setFirstLoadingFetchTrades(false)

    await advancedTradingViewAdapter.fetchPairTrades({
      inputToken,
      outputToken,
      amountToFetch: AdapterAmountToFetch.pairTrades,
      isFirstFetch: false,
    })
  }

  const fetchActivity = async () => {
    if (!advancedTradingViewAdapter || !inputToken || !outputToken) return
    setFirstLoadingFetchActivity(false)

    await advancedTradingViewAdapter.fetchPairActivity({
      inputToken,
      outputToken,
      amountToFetch: AdapterAmountToFetch.pairActivity,
      isFirstFetch: false,
    })
  }

  useEffect(() => {
    const fetchTrades = async () => {
      if (!advancedTradingViewAdapter || !inputToken || !outputToken) return

      advancedTradingViewAdapter.setPairTokens(inputToken, outputToken)

      if (
        // do not fetch data if user reversed pair
        previousTokens.current.inputTokenAddress !== outputToken.address.toLowerCase() ||
        previousTokens.current.outputTokenAddress !== inputToken.address.toLowerCase()
      ) {
        setSymbol(`${inputToken.symbol}${outputToken.symbol}`)
        setFirstLoadingFetchTrades(true)
        setFirstLoadingFetchActivity(true)
        try {
          await Promise.allSettled([
            advancedTradingViewAdapter.fetchPairTrades({
              inputToken,
              outputToken,
              amountToFetch: AdapterAmountToFetch.pairTrades,
              isFirstFetch: true,
            }),
            advancedTradingViewAdapter.fetchPairActivity({
              inputToken,
              outputToken,
              amountToFetch: AdapterAmountToFetch.pairActivity,
              isFirstFetch: true,
            }),
          ])
        } catch (e) {
          console.error(e)
        }
      }

      const fromTokenAddress = inputToken.address.toLowerCase()
      const toTokenAddress = outputToken.address.toLowerCase()

      previousTokens.current = {
        inputTokenAddress: fromTokenAddress,
        outputTokenAddress: toTokenAddress,
      }
    }

    fetchTrades()
  }, [dispatch, inputToken, outputToken, advancedTradingViewAdapter])

  return {
    symbol,
    showTrades: Boolean(inputToken && outputToken),
    chainId,
    inputToken,
    outputToken,
    fetchTrades,
    fetchActivity,
    isFirstLoadingFetchTrades,
    isFirstLoadingFetchActivity,
  }
}
