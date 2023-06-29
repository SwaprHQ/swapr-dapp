import {
  ChainId,
  Currency,
  CurrencyAmount,
  currencyEquals,
  DAI,
  Fraction,
  JSBI,
  Price,
  TEN,
  Token,
  TokenAmount,
  UniswapV2RoutablePlatform,
  USDC,
} from '@swapr/sdk'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useRef, useState } from 'react'

import { REFETCH_DATA_INTERVAL } from '../constants/data'
import { tryParseAmount } from '../state/swap/hooks'
import {
  CoinGeckoUsdQuote,
  COINGECKO_NATIVE_CURRENCY,
  getUSDPriceCurrencyQuote,
  getUSDPriceTokenQuote,
  toPriceInformation,
} from '../utils/coingecko'
import { currencyId } from '../utils/currencyId'
import { wrappedCurrencyAmount } from '../utils/wrappedCurrency'

import { useTradeExactInUniswapV2 } from './Trades'

import { useActiveWeb3React } from './index'

const STABLECOIN_AND_PLATFOM_BY_CHAIN: Record<number, { stablecoin: Token; platform: UniswapV2RoutablePlatform }> = {
  [ChainId.MAINNET]: { stablecoin: DAI[ChainId.MAINNET], platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.POLYGON]: { stablecoin: USDC[ChainId.POLYGON], platform: UniswapV2RoutablePlatform.QUICKSWAP },
  [ChainId.ARBITRUM_ONE]: { stablecoin: USDC[ChainId.ARBITRUM_ONE], platform: UniswapV2RoutablePlatform.UNISWAP },
  [ChainId.XDAI]: { stablecoin: USDC[ChainId.XDAI], platform: UniswapV2RoutablePlatform.SWAPR },
  [ChainId.OPTIMISM_MAINNET]: {
    stablecoin: DAI[ChainId.OPTIMISM_MAINNET],
    platform: UniswapV2RoutablePlatform.UNISWAP,
  },
}

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

interface ComputedPriceInformation {
  usdPrice?: Price
  apiUsdPercentageChangePrice24h?: number
  apiIsIncome24h?: boolean
}

export function useCoingeckoUSDPrice(token?: Token, isNativeCurrency = false) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [price, setPrice] = useState<Price>()
  const [percentagePriceChange24h, setPercentagePriceChange24h] = useState<number>()
  const [isIncome24h, setIsIncome24h] = useState<boolean>()

  // token is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const tokenRef = useRef(token)
  tokenRef.current = token
  const tokenAddress = token ? currencyId(token) : undefined

  const queryKey = isNativeCurrency ? COINGECKO_NATIVE_CURRENCY[chainId] : tokenAddress

  const { isLoading, error } = useQuery<CoinGeckoUsdQuote, Error, ComputedPriceInformation | null>(
    ['priceInfo', queryKey],
    () => {
      let getUSDPriceQuote
      if (isNativeCurrency) {
        getUSDPriceQuote = getUSDPriceCurrencyQuote({ chainId })
      } else {
        getUSDPriceQuote = getUSDPriceTokenQuote({ tokenAddress, chainId })
      }
      return getUSDPriceQuote
    },
    {
      enabled: !!tokenAddress || isNativeCurrency,
      retry: false,
      retryOnMount: false,
      refetchOnMount: true,
      staleTime: price ? Infinity : 0,
      refetchInterval: REFETCH_DATA_INTERVAL,
      select: data => {
        const baseAmount = tryParseAmount('1', tokenRef.current)
        const priceResponse = toPriceInformation(data)

        if (!priceResponse?.amount || !baseAmount) {
          return null
        }

        const {
          amount: apiUsdPrice,
          percentageAmountChange24h: apiUsdPercentageChangePrice24h,
          isIncome24h: apiIsIncome24h,
        } = priceResponse

        // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
        // we need to parse all USD returned amounts
        // and convert to the same currencyRef.current for both sides (SDK math invariant)
        // in our case we stick to the USDC paradigm
        const quoteAmount = tryParseAmount(apiUsdPrice, STABLECOIN_AND_PLATFOM_BY_CHAIN[chainId]?.stablecoin, chainId)
        // parse failure is unlikely - type safe
        if (!quoteAmount) {
          return null
        }
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

        return { usdPrice, apiIsIncome24h, apiUsdPercentageChangePrice24h }
      },
      onSuccess: data => {
        if (!!data) {
          setPrice(data.usdPrice)
          setPercentagePriceChange24h(data.apiUsdPercentageChangePrice24h)
          setIsIncome24h(data.apiIsIncome24h)
        }
      },
      onError: error => {
        console.error(
          '[useUSDCPrice::useCoingeckoUSDPrice]::Error getting USD price from Coingecko for token',
          tokenAddress,
          error
        )
        setPrice(undefined)
        setPercentagePriceChange24h(0)
        setIsIncome24h(false)
      },
    }
  )

  return { price, percentagePriceChange24h, isIncome24h, error, loading: isLoading }
}

interface GetPriceQuoteParams {
  tokenAmount?: TokenAmount | null
  error?: Error | null
  price?: Price | null
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
