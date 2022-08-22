import { ChainId, Currency, WETH, WMATIC, WXDAI } from '@swapr/sdk'

import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { useToken } from '../../hooks/Tokens'
import store from '../../state'
import { useSwapState } from '../../state/swap/hooks'
import { SWPRSupportedChains } from '../../utils/chainSupportsSWPR'
import { SwaprAdapter } from './adapters/swapr.adapter'
import { TradesAdapter } from './adapters/trades.adapter'
import { Adapters } from './trades.types'

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

//TODO: handle loading
export const useTradesAdapter = () => {
  const { chainId } = useActiveWeb3React()
  const [tradesAdapter, setTradesAdapter] = useState<TradesAdapter>()
  const [symbol, setSymbol] = useState<string>()
  const previousTokens = useRef<{ inputTokenAddress?: string; outputTokenAddress?: string }>({
    inputTokenAddress: undefined,
    outputTokenAddress: undefined,
  })

  const dispatch = useDispatch()

  const [skip, setSkip] = useState(50)
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
    if (!tradesAdapter && chainId) {
      const tradesHistoryAdapter = new TradesAdapter({ adapters, chainId, store })
      setTradesAdapter(tradesHistoryAdapter)
    }

    if (tradesAdapter) {
      if (tradesAdapter.isInitialized && chainId) {
        tradesAdapter.updateActiveChainId(chainId)
      } else {
        tradesAdapter.init()
      }
    }
  }, [chainId, tradesAdapter])

  const fetchTrades = async () => {
    if (!tradesAdapter || !inputToken || !outputToken) return

    await tradesAdapter.fetchTradesHistory(inputToken, outputToken, 50, skip)

    setSkip(prev => prev + 50)
  }

  useEffect(() => {
    const fetchTrades = async () => {
      if (!tradesAdapter || !inputToken || !outputToken) return
      tradesAdapter.setPairTokensAddresses(inputToken, outputToken)
      if (
        // do not fetch data if user reversed pair
        previousTokens.current.inputTokenAddress !== outputToken.address.toLowerCase() ||
        previousTokens.current.outputTokenAddress !== inputToken.address.toLowerCase()
      ) {
        setSymbol(`${inputToken.symbol}${outputToken.symbol}`)

        setIsLoading(true)

        await tradesAdapter.fetchTradesHistory(inputToken, outputToken, 50, 0)

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
  }, [dispatch, inputToken, outputToken, tradesAdapter])

  return {
    symbol,
    showTrades: inputToken && outputToken ? true : false, // Boolean(inputToken && outputToken) ?
    chainId,
    inputToken: inputToken ?? undefined,
    outputToken: outputToken ?? undefined,
    fetchTrades,
    isLoading,
  }
}
