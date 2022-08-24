import { ChainId, Currency, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { useToken } from '../../hooks/Tokens'
import store from '../../state'
import { useSwapState } from '../../state/swap/hooks'
import { SWPRSupportedChains } from '../../utils/chainSupportsSWPR'
import { AdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { SwaprAdapter } from './adapters/swapr.adapter'
import { Adapters } from './advancedTradingView.types'

const WrappedNativeCurrencyAddress = {
  [ChainId.MAINNET]: WETH[ChainId.MAINNET].address,
  [ChainId.ARBITRUM_ONE]: WETH[ChainId.ARBITRUM_ONE].address,
  [ChainId.XDAI]: WXDAI[ChainId.XDAI].address,
  [ChainId.POLYGON]: WMATIC[ChainId.POLYGON].address,
  [ChainId.RINKEBY]: WETH[ChainId.RINKEBY].address,
  [ChainId.GOERLI]: WETH[ChainId.GOERLI].address,
  [ChainId.ARBITRUM_GOERLI]: WETH[ChainId.ARBITRUM_GOERLI].address,
  [ChainId.ARBITRUM_RINKEBY]: WETH[ChainId.ARBITRUM_RINKEBY].address,
}

const adapters: Adapters = {
  swapr: new SwaprAdapter(),
}

const getTokenAddress = (chainId: ChainId, tokenAddress: string | undefined) =>
  tokenAddress === Currency.getNative(chainId).symbol
    ? WrappedNativeCurrencyAddress[chainId as SWPRSupportedChains]
    : tokenAddress

export const useAdvancedTradingViewAdapter = () => {
  const { chainId } = useActiveWeb3React()
  const [advancedTradingViewAdapter, setAdvancedTradingViewAdapter] = useState<AdvancedTradingViewAdapter>()
  const [symbol, setSymbol] = useState<string>()
  const previousTokens = useRef<{ inputTokenAddress?: string; outputTokenAddress?: string }>({
    inputTokenAddress: undefined,
    outputTokenAddress: undefined,
  })

  const dispatch = useDispatch()

  const [skip, setSkip] = useState({
    trades: 50,
    activity: 25,
  })
  const [isLoading, setIsLoading] = useState(false)

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
      const tradesHistoryAdapter = new AdvancedTradingViewAdapter({ adapters, chainId, store })
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

    await advancedTradingViewAdapter.fetchPairTrades(50, skip.trades)

    setSkip({ ...skip, trades: skip.trades + 50 })
  }

  const fetchActivity = async () => {
    if (!advancedTradingViewAdapter || !inputToken || !outputToken) return

    await advancedTradingViewAdapter.fetchPairActivity(25, skip.activity)

    setSkip({ ...skip, trades: skip.activity + 25 })
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

        setIsLoading(true)

        advancedTradingViewAdapter.setInitialArgumentsForPair(inputToken, outputToken)
        await Promise.all([
          advancedTradingViewAdapter.fetchPairTrades(50, 0),
          advancedTradingViewAdapter.fetchPairActivity(25, 0),
        ])

        setIsLoading(false)
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
    inputToken: inputToken ?? undefined,
    outputToken: outputToken ?? undefined,
    fetchTrades,
    fetchActivity,
    isLoading,
  }
}
