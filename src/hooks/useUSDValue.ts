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
  TokenAmount,
  UniswapV2RoutablePlatform,
} from '@swapr/sdk'

import { useEffect, useMemo, useRef, useState } from 'react'

import { DAI, USDC } from '../constants/index'
import { tryParseAmount } from '../state/swap/hooks'
import { getUSDPriceCurrencyQuote, getUSDPriceTokenQuote, toPriceInformation } from '../utils/coingecko'
import { currencyId } from '../utils/currencyId'
import { wrappedCurrencyAmount } from '../utils/wrappedCurrency'
import { useTradeExactInUniswapV2 } from './Trades'

import { useActiveWeb3React } from './index'

const STABLECOIN_AND_PLATFOM_BY_CHAIN: Record<number, { stablecoin: Token; platform: UniswapV2RoutablePlatform }> = {
  [ChainId.MAINNET]: { stablecoin: DAI[ChainId.MAINNET], platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.POLYGON]: { stablecoin: USDC[ChainId.POLYGON], platform: UniswapV2RoutablePlatform.QUICKSWAP },
  [ChainId.ARBITRUM_ONE]: { stablecoin: USDC[ChainId.ARBITRUM_ONE], platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.XDAI]: { stablecoin: USDC[ChainId.XDAI], platform: UniswapV2RoutablePlatform.SWAPR },
}

const FETCH_PRICE_INTERVAL = 15000

const convertToTokenAmount = (currencyAmount: CurrencyAmount | undefined, chainId: ChainId) => {
  if (!currencyAmount) return

  if (Currency.isNative(currencyAmount.currency)) return wrappedCurrencyAmount(currencyAmount, chainId)

  if (!currencyAmount.currency.address) return

  const token = new Token(
    chainId,
    currencyAmount.currency.address,
    currencyAmount.currency.decimals,
    currencyAmount?.currency.symbol,
    currencyAmount?.currency.name
  )

  return new TokenAmount(token, currencyAmount.raw)
}

export function useUSDPrice(tokenAmount?: TokenAmount) {
  const { chainId } = useActiveWeb3React()

  let stablecoin: Token | undefined = undefined
  let platform: UniswapV2RoutablePlatform | undefined = undefined

  if (chainId && STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId] !== undefined) {
    stablecoin = STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId].stablecoin
    platform = STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId].platform
  }

  const tradeExactInUniswapV2 = useTradeExactInUniswapV2(tokenAmount, stablecoin, platform)

  return useMemo(() => {
    if (!tokenAmount || !chainId || !stablecoin || !tradeExactInUniswapV2) return undefined

    const currency = tokenAmount.currency

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
  }, [chainId, tokenAmount, stablecoin, tradeExactInUniswapV2])
}

export function useCoingeckoUSDPrice(token?: Token, isNativeCurrency = false) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [price, setPrice] = useState<Price | undefined>()
  const [error, setError] = useState<Error | undefined>()

  // token is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const tokenRef = useRef(token)
  tokenRef.current = token

  const tokenAddress = token ? currencyId(token) : undefined
  useEffect(() => {
    const fetchPrice = () => {
      const baseAmount = tryParseAmount('1', tokenRef.current)

      if (!chainId || !tokenAddress || !baseAmount) return

      let getUSDPriceQuote

      if (isNativeCurrency) {
        getUSDPriceQuote = getUSDPriceCurrencyQuote({ chainId })
      } else {
        getUSDPriceQuote = getUSDPriceTokenQuote({ tokenAddress, chainId })
      }

      getUSDPriceQuote
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
    // don't depend on token (deep nested object)
  }, [chainId, tokenAddress, isNativeCurrency])

  return { price, error }
}

interface GetPriceQuoteParams {
  tokenAmount?: TokenAmount
  error?: Error
  price?: Price
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, tokenAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !tokenAmount) return null

    try {
      return price.quote(tokenAmount)
    } catch {
      return null
    }
  }, [tokenAmount, error, price])
}

export function useUSDValue(tokenAmount?: TokenAmount) {
  const price = useUSDPrice(tokenAmount)

  return useGetPriceQuote({ price: price, tokenAmount: tokenAmount })
}

export function useCoingeckoUSDValue(tokenAmount?: TokenAmount, isNativeCurrency = false) {
  const coingeckoUsdPrice = useCoingeckoUSDPrice(tokenAmount?.token, isNativeCurrency)

  return useGetPriceQuote({
    ...coingeckoUsdPrice,
    tokenAmount: tokenAmount,
  })
}

export function useHigherUSDValue({
  inputCurrencyAmount,
  outputCurrencyAmount,
}: {
  inputCurrencyAmount?: CurrencyAmount
  outputCurrencyAmount?: CurrencyAmount
}) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()

  const inputTokenAmount = convertToTokenAmount(inputCurrencyAmount, chainId)
  const outputTokenAmount = convertToTokenAmount(outputCurrencyAmount, chainId)
  const inputIsNativeCurrency = inputCurrencyAmount && Currency.isNative(inputCurrencyAmount?.currency)
  const outputIsNativeCurrency = outputCurrencyAmount && Currency.isNative(outputCurrencyAmount?.currency)

  const inputUSDPrice = useUSDValue(inputTokenAmount)
  const outputUSDPrice = useUSDValue(outputTokenAmount)

  const inputCoingeckoUSDPrice = useCoingeckoUSDValue(inputTokenAmount, inputIsNativeCurrency)
  const outputCoingeckoUSDPrice = useCoingeckoUSDValue(outputTokenAmount, outputIsNativeCurrency)

  return {
    fiatValueInput: inputCoingeckoUSDPrice || inputUSDPrice,
    fiatValueOutput: outputCoingeckoUSDPrice || outputUSDPrice,
    isFallbackFiatValueInput: !inputCoingeckoUSDPrice,
    isFallbackFiatValueOutput: !outputCoingeckoUSDPrice,
  }
}
