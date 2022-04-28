import { Token, Trade, currencyEquals, Price, CurrencyAmount, Currency, Fraction, JSBI, TEN } from '@swapr/sdk'
import { useTradeExactInAllPlatforms } from './Trades'
import { ChainId } from '@swapr/sdk'
import { USDC, DAI } from '../constants/index'
import { useActiveWeb3React } from './index'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { currencyId } from '../utils/currencyId'
import { tryParseAmount } from '../state/swap/hooks'
import { getUSDPriceQuote, toPriceInformation } from '../utils/coingecko'
import { wrappedCurrency, wrappedCurrencyAmount } from '../utils/wrappedCurrency'

const STABLECOIN_OUT: { [chainId: number]: Token } = {
  [ChainId.MAINNET]: DAI,
  [ChainId.ARBITRUM_ONE]: USDC[ChainId.ARBITRUM_ONE],
  [ChainId.XDAI]: USDC[ChainId.XDAI]
}

export function useUSDPrice(currencyAmount?: CurrencyAmount, selectedTrade?: Trade) {
  const { chainId } = useActiveWeb3React()
  const stablecoin = chainId ? STABLECOIN_OUT[chainId] : undefined

  const tradeExactOutAllPlatforms = useTradeExactInAllPlatforms(currencyAmount, stablecoin)

  return useMemo(() => {
    if (!currencyAmount || !chainId || !stablecoin || !tradeExactOutAllPlatforms) return undefined

    const currency = currencyAmount.currency

    if (currencyEquals(currency, stablecoin))
      return new Price({
        baseCurrency: currency,
        quoteCurrency: currency,
        denominator: '1',
        numerator: '1'
      })

    const filterSelectedPlataforms = (trade?: Trade) => {
      if (!trade || !selectedTrade) return false
      return selectedTrade.platform.name === trade.platform.name
    }

    const calculateBestPrice = (trades: (Trade | undefined)[]): Price | undefined => {
      if (!trades || !trades.length) return undefined

      const selectedPlataformTrade = trades.filter(filterSelectedPlataforms)[0]

      if (!selectedPlataformTrade) return undefined

      const { numerator, denominator } = selectedPlataformTrade?.executionPrice

      return new Price({
        baseCurrency: currency,
        quoteCurrency: stablecoin,
        denominator,
        numerator
      })
    }

    return calculateBestPrice(tradeExactOutAllPlatforms)
  }, [chainId, currencyAmount, selectedTrade, stablecoin, tradeExactOutAllPlatforms])
}

export function useCoingeckoUSDPrice(currency?: Currency) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [price, setPrice] = useState<Price | undefined>()
  const [error, setError] = useState<Error | undefined>()

  const wrappedCurr = wrappedCurrency(currency, chainId) as Currency

  const tokenAddress = wrappedCurr ? currencyId(wrappedCurr) : undefined

  const fetchPrice = useCallback(() => {
    const baseAmount = tryParseAmount('1', wrappedCurr)

    if (!chainId || !tokenAddress || !baseAmount) return

    getUSDPriceQuote({
      chainId,
      tokenAddress
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
        const quoteAmount = tryParseAmount(apiUsdPrice, STABLECOIN_OUT[chainId], chainId)

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
          numerator: result.numerator
        })

        console.debug(
          '[useCoingeckoUSDPrice] Best Coingecko USD price amount',
          usdPrice.toSignificant(12),
          usdPrice.invert().toSignificant(12)
        )

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
  }, [chainId, tokenAddress, wrappedCurr])

  useEffect(() => {
    fetchPrice()
  }, [fetchPrice])

  return { price, error, refetch: fetchPrice }
}

interface GetPriceQuoteParams {
  currencyAmount?: CurrencyAmount
  error?: Error
  price?: Price
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return

    try {
      return price.quote(currencyAmount)
    } catch {
      return
    }
  }, [currencyAmount, error, price])
}

export function useUSDValue(currencyAmount?: CurrencyAmount, selectedTrade?: Trade) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount, chainId)

  const price = useUSDPrice(wrappedCurrencyToken as CurrencyAmount, selectedTrade)

  return useGetPriceQuote({ price: price, currencyAmount: wrappedCurrencyToken as CurrencyAmount })
}

export function useCoingeckoUSDValue(currencyAmount?: CurrencyAmount) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount, chainId)

  const coingeckoUsdPrice = useCoingeckoUSDPrice(wrappedCurrencyToken?.currency)
  return {
    currencyAmount: useGetPriceQuote({
      price: coingeckoUsdPrice.price,
      error: coingeckoUsdPrice.error,
      currencyAmount: wrappedCurrencyToken as CurrencyAmount
    }),
    refetch: coingeckoUsdPrice.refetch
  }
}

export function useHigherUSDValue(currencyAmount?: CurrencyAmount, selectedTrade?: Trade) {
  const USDPrice = useUSDValue(currencyAmount, selectedTrade)
  const coingeckoUSDPrice = useCoingeckoUSDValue(currencyAmount)

  return { price: coingeckoUSDPrice?.currencyAmount || USDPrice, refetch: coingeckoUSDPrice?.refetch }
}
