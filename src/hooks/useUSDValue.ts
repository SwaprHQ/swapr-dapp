import {
  ChainId,
  Currency,
  CurrencyAmount,
  currencyEquals,
  Fraction,
  JSBI,
  Price,
  TEN,
  Token,
  Trade,
  UniswapV2RoutablePlatform,
} from '@swapr/sdk'

import { useEffect, useMemo, useState } from 'react'

import { DAI, USDC } from '../constants/index'
import { tryParseAmount } from '../state/swap/hooks'
import { getUSDPriceQuote, toPriceInformation } from '../utils/coingecko'
import { currencyId } from '../utils/currencyId'
import { wrappedCurrency, wrappedCurrencyAmount } from '../utils/wrappedCurrency'
import { useTradeExactInUniswapV2 } from './Trades'

import { useActiveWeb3React } from './index'

const STABLECOIN_AND_PLATFOM_BY_CHAIN: Record<number, { stablecoin: Token; platform: UniswapV2RoutablePlatform }> = {
  [ChainId.MAINNET]: { stablecoin: DAI, platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.POLYGON]: { stablecoin: USDC[ChainId.POLYGON], platform: UniswapV2RoutablePlatform.QUICKSWAP },
  [ChainId.ARBITRUM_ONE]: { stablecoin: USDC[ChainId.ARBITRUM_ONE], platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.XDAI]: { stablecoin: USDC[ChainId.XDAI], platform: UniswapV2RoutablePlatform.SUSHISWAP },
}

const FETCH_PRICE_INTERVAL = 15000

export function useUSDPrice(currencyAmount?: CurrencyAmount) {
  const { chainId } = useActiveWeb3React()

  let stablecoin: Token | undefined = undefined
  let platform: UniswapV2RoutablePlatform | undefined = undefined

  if (chainId && STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId] !== undefined) {
    stablecoin = STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId].stablecoin
    platform = STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId].platform
  }

  const tradeExactInUniswapV2 = useTradeExactInUniswapV2(currencyAmount, stablecoin, platform)

  return useMemo(() => {
    if (!currencyAmount || !chainId || !stablecoin || !tradeExactInUniswapV2) return undefined

    const currency = currencyAmount.currency

    if (currencyEquals(currency, stablecoin))
      return new Price({
        baseCurrency: currency,
        quoteCurrency: currency,
        denominator: '1',
        numerator: '1',
      })

    const { numerator, denominator } = tradeExactInUniswapV2?.executionPrice

    return new Price({
      baseCurrency: currency,
      quoteCurrency: stablecoin,
      denominator,
      numerator,
    })
  }, [chainId, currencyAmount, stablecoin, tradeExactInUniswapV2])
}

export function useCoingeckoUSDPrice(currency?: Currency) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [price, setPrice] = useState<Price | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const wrappedCurr = wrappedCurrency(currency, chainId)
  const tokenAddress = wrappedCurr ? currencyId(wrappedCurr) : undefined

  useEffect(() => {
    const fetchPrice = () => {
      const baseAmount = tryParseAmount('1', wrappedCurr)

      if (!chainId || !tokenAddress || !baseAmount) return

      getUSDPriceQuote({
        chainId,
        tokenAddress,
      })
        .then(toPriceInformation)
        .then(priceResponse => {
          setError(undefined)

          if (!priceResponse?.amount) return

          const { amount: apiUsdPrice } = priceResponse
          // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
          // we need to parse all USD returned amounts
          // and convert to the same currencyRef.current for both sides (SDK math invariant)
          // in our case we stick to the USDC paradigm
          const quoteAmount = tryParseAmount(apiUsdPrice, STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId].stablecoin, chainId)

          // parse failure is unlikely - type safe
          if (!quoteAmount) return
          // create a new Price object
          // we need to calculate the scalar
          // to take the different decimal places
          // between tokens into account
          const scalar = new Fraction(
            JSBI.exponentiate(TEN, JSBI.BigInt(baseAmount.currency.decimals)),
            JSBI.exponentiate(TEN, JSBI.BigInt(quoteAmount.currency.decimals))
          )
          const result = quoteAmount.divide(scalar).divide(baseAmount)
          const usdPrice = new Price({
            baseCurrency: baseAmount.currency,
            quoteCurrency: quoteAmount.currency,
            denominator: result.denominator,
            numerator: result.numerator,
          })

          setPrice(usdPrice)
        })
        .catch(error => {
          console.error(
            '[useUSDCPrice::useCoingeckoUSDPrice]::Error getting USD price from Coingecko for token',
            tokenAddress,
            error
          )
          setError(new Error(error))
          setPrice(undefined)
        })
    }

    fetchPrice()

    const refetchPrice = setInterval(() => {
      fetchPrice()
    }, FETCH_PRICE_INTERVAL)

    return () => {
      clearInterval(refetchPrice)
    }
  }, [chainId, tokenAddress, wrappedCurr])

  return { price, error }
}

interface GetPriceQuoteParams {
  currencyAmount?: CurrencyAmount
  error?: Error
  price?: Price
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.quote(currencyAmount)
    } catch {
      return null
    }
  }, [currencyAmount, error, price])
}

export function useUSDValue(currencyAmount?: CurrencyAmount) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount, chainId)

  const price = useUSDPrice(wrappedCurrencyToken)

  return useGetPriceQuote({ price: price, currencyAmount: wrappedCurrencyToken })
}

export function useCoingeckoUSDValue(currencyAmount?: CurrencyAmount) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount, chainId)

  const coingeckoUsdPrice = useCoingeckoUSDPrice(wrappedCurrencyToken?.currency)

  return useGetPriceQuote({
    ...coingeckoUsdPrice,
    currencyAmount: wrappedCurrencyToken,
  })
}

export function useHigherUSDValue({
  inputCurrencyAmount,
  outputCurrencyAmount,
}: {
  inputCurrencyAmount?: CurrencyAmount
  outputCurrencyAmount?: CurrencyAmount
  trade?: Trade
}) {
  const inputUSDPrice = useUSDValue(inputCurrencyAmount)
  const outputUSDPrice = useUSDValue(outputCurrencyAmount)

  const inputCoingeckoUSDPrice = useCoingeckoUSDValue(inputCurrencyAmount)
  const outputCoingeckoUSDPrice = useCoingeckoUSDValue(outputCurrencyAmount)

  return {
    fiatValueInput: inputCoingeckoUSDPrice || inputUSDPrice,
    fiatValueOutput: outputCoingeckoUSDPrice || outputUSDPrice,
    isFallbackFiatValueInput: !inputCoingeckoUSDPrice,
    isFallbackFiatValueOutput: !outputCoingeckoUSDPrice,
  }
}
