import { ChainId, Currency, Token, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { useToken } from '../../hooks/Tokens'
import { useRouter } from '../../hooks/useRouter'
import store, { AppState } from '../../state'
import { useSwapState } from '../../state/swap/hooks'
import { adapters } from './adapters/adapters.config'
import { AdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { AdapterAmountToFetch } from './advancedTradingView.types'
import { actions as advancedTradingViewReducerActions } from './store/advancedTradingView.reducer'
import { sortsBeforeTokens } from './store/advancedTradingView.selectors'

const WrappedNativeCurrencyAddress = {
  [ChainId.MAINNET]: WETH[ChainId.MAINNET].address,
  [ChainId.ARBITRUM_ONE]: WETH[ChainId.ARBITRUM_ONE].address,
  [ChainId.GNOSIS]: WXDAI[ChainId.GNOSIS].address,
  [ChainId.POLYGON]: WMATIC[ChainId.POLYGON].address,
  [ChainId.OPTIMISM_MAINNET]: WETH[ChainId.OPTIMISM_MAINNET].address,
}

const getTokenAddress = (chainId: ChainId, tokenAddress: string | undefined) =>
  tokenAddress === Currency.getNative(chainId).symbol
    ? WrappedNativeCurrencyAddress[chainId as ChainId.MAINNET | ChainId.ARBITRUM_ONE | ChainId.GNOSIS]
    : tokenAddress

const calculateAmountToFetch = (chainId: ChainId | undefined, amountToFetch: number) => {
  const { supportedAdaptersByChain, unsupportedAdaptersByChain } = Object.values(adapters).reduce(
    (totalAdapters, adapter) => {
      adapter.isSupportedChainId(chainId)
        ? totalAdapters.supportedAdaptersByChain++
        : totalAdapters.unsupportedAdaptersByChain++

      return totalAdapters
    },
    { supportedAdaptersByChain: 0, unsupportedAdaptersByChain: 0 }
  )

  const amount = Math.floor((amountToFetch * unsupportedAdaptersByChain) / supportedAdaptersByChain) + amountToFetch

  return amount > AdapterAmountToFetch.LIMIT ? AdapterAmountToFetch.LIMIT : amount
}

export const useAdvancedTradingView = () => {
  const { chainId } = useActiveWeb3React()

  const { navigate } = useRouter()

  const [pairTokens, setPairTokens] = useState<Token[]>([])

  const [activeCurrencyOption, setActiveCurrencyOption] = useState<Token>()

  const [advancedTradingViewAdapter, setAdvancedTradingViewAdapter] = useState<AdvancedTradingViewAdapter<AppState>>()

  const [symbol, setSymbol] = useState<string>()

  const [pairTradesAmountToFetch, pairActivityAmountToFetch] = useMemo(
    () => [
      calculateAmountToFetch(chainId, AdapterAmountToFetch.PAIR_TRADES),
      calculateAmountToFetch(chainId, AdapterAmountToFetch.PAIR_ACTIVITY),
    ],
    [chainId]
  )

  const previousTokens = useRef<{ inputTokenAddress?: string; outputTokenAddress?: string }>({
    inputTokenAddress: undefined,
    outputTokenAddress: undefined,
  })

  const [isLoadingTrades, setIsLoadingTrades] = useState(false)
  const [isLoadingActivity, setIsLoadingActivity] = useState(false)
  const [isFetched, setIsFetched] = useState(false)

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

  useEffect(() => {
    if (inputToken && outputToken) {
      const sortedTokens = sortsBeforeTokens(inputToken, outputToken)

      setPairTokens(sortedTokens)

      setActiveCurrencyOption(sortedTokens[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputToken?.address, outputToken?.address])

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
        setIsLoadingTrades(false)
        setIsLoadingActivity(true)
        setIsFetched(false)

        try {
          await Promise.allSettled([
            advancedTradingViewAdapter.fetchPairTradesBulkUpdate({
              inputToken,
              outputToken,
              amountToFetch: pairTradesAmountToFetch,
              isFirstFetch: true,
            }),
            advancedTradingViewAdapter.fetchPairActivityBulkUpdate({
              inputToken,
              outputToken,
              amountToFetch: pairActivityAmountToFetch,
              isFirstFetch: true,
            }),
          ])
        } catch (e) {
          console.error(e)
        } finally {
          setIsLoadingTrades(false)
          setIsLoadingActivity(false)
          setIsFetched(true)
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

    const interval = setInterval(() => {
      dispatch(advancedTradingViewReducerActions.resetAdapterStore({ resetSelectedPair: false }))

      fetchTrades()
    }, 15000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    dispatch,
    inputToken?.address,
    outputToken?.address,
    advancedTradingViewAdapter,
    pairTradesAmountToFetch,
    pairActivityAmountToFetch,
  ])

  const handleAddLiquidity = () => {
    if (inputToken && outputToken) {
      navigate(`/pools/add/${inputToken.address}/${outputToken.address}`)
    }
  }

  const handleSwitchCurrency = (option: Token) => {
    if (activeCurrencyOption?.address !== option.address) {
      setActiveCurrencyOption(option)
    }
  }

  const fetchTrades = async () => {
    if (!advancedTradingViewAdapter || !inputToken || !outputToken) return

    setIsLoadingTrades(true)
    try {
      await advancedTradingViewAdapter.fetchPairTradesBulkUpdate({
        inputToken,
        outputToken,
        amountToFetch: AdapterAmountToFetch.PAIR_TRADES,
        isFirstFetch: false,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingTrades(false)
    }
  }

  const fetchActivity = async () => {
    if (!advancedTradingViewAdapter || !inputToken || !outputToken) return

    setIsLoadingActivity(true)
    try {
      await advancedTradingViewAdapter.fetchPairActivityBulkUpdate({
        inputToken,
        outputToken,
        amountToFetch: AdapterAmountToFetch.PAIR_ACTIVITY,
        isFirstFetch: false,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingActivity(false)
    }
  }

  return {
    symbol,
    pairTokens,
    showTrades: Boolean(inputToken && outputToken),
    chainId,
    isFetched,
    inputToken,
    outputToken,
    fetchTrades,
    fetchActivity,
    isLoadingTrades,
    isLoadingActivity,
    handleAddLiquidity,
    handleSwitchCurrency,
    activeCurrencyOption,
  }
}
