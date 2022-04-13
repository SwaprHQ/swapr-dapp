import { Token, Trade, currencyEquals, Price, CurrencyAmount, Currency, Fraction, JSBI, TEN } from '@swapr/sdk'
import { useTradeExactInAllPlatforms } from './Trades'
import { ChainId } from '@swapr/sdk'
import { USDC, DAI } from '../constants/index'
import { useActiveWeb3React } from './index'
import { useEffect, useMemo, useRef, useState } from 'react'
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

    if (currencyEquals(currency, stablecoin)) return new Price(currency, currency, '1', '1')

    const filterSelectedPlataforms = (trade: Trade | undefined) => {
      if (!trade || !selectedTrade) return false
      return selectedTrade.platform.name === trade.platform.name
    }

    const calculateBestPrice = (trades: (Trade | undefined)[]): Price | undefined => {
      if (!trades || !trades.length) return undefined

      const selectedPlataformTrade = trades.filter(filterSelectedPlataforms)[0]

      if (!selectedPlataformTrade) return undefined

      const { numerator, denominator } = selectedPlataformTrade?.executionPrice

      return new Price(currency, stablecoin, denominator, numerator)
    }

    return calculateBestPrice(tradeExactOutAllPlatforms)
  }, [chainId, currencyAmount, selectedTrade, stablecoin, tradeExactOutAllPlatforms])
}

export function useCoingeckoUSDPrice(currency?: Currency) {
  // default to MAINNET (if disconnected e.g)
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const [price, setPrice] = useState<Price | null>(null)
  const [error, setError] = useState<Error | null>(null)

  // Currency is deep nested and we only really care about token address changing
  // so we ref it here as to avoid updating useEffect
  const currencyRef = useRef(wrappedCurrency(currency, chainId) as Currency)
  currencyRef.current = wrappedCurrency(currency, chainId) as Currency

  const tokenAddress = currencyRef.current ? currencyId(currencyRef.current) : undefined
  useEffect(() => {
    const baseAmount = tryParseAmount('1', currencyRef.current)

    if (!chainId || !tokenAddress || !baseAmount) return

    getUSDPriceQuote({
      chainId,
      tokenAddress
    })
      .then(toPriceInformation)
      .then(priceResponse => {
        setError(null)

        if (!priceResponse?.amount) return

        const { amount: apiUsdPrice } = priceResponse
        // api returns converted units e.g $2.25 instead of 2255231233312312 (atoms)
        // we need to parse all USD returned amounts
        // and convert to the same currencyRef.current for both sides (SDK math invariant)
        // in our case we stick to the USDC paradigm
        const quoteAmount = tryParseAmount(apiUsdPrice, STABLECOIN_OUT[chainId], chainId)
        console.log('pricesx', apiUsdPrice)

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
        const usdPrice = new Price(baseAmount.currency, quoteAmount.currency, result.denominator, result.numerator)

        console.debug(
          '[useCoingeckoUSDPrice] Best Coingecko USD price amount',
          usdPrice.toSignificant(12),
          usdPrice.invert().toSignificant(12)
        )

        return setPrice(usdPrice)
      })
      .catch(error => {
        console.error(
          '[useUSDCPrice::useCoingeckoUSDPrice]::Error getting USD price from Coingecko for token',
          tokenAddress,
          error
        )
        return () => {
          setError(new Error(error))
          setPrice(null)
        }
      })
    // don't depend on Currency (deep nested object)
  }, [chainId, tokenAddress])

  return { price, error }
}

interface GetPriceQuoteParams {
  currencyAmount?: CurrencyAmount
  error: Error | null
  price: Price | null
}

// common logic for returning price quotes
function useGetPriceQuote({ price, error, currencyAmount }: GetPriceQuoteParams) {
  return useMemo(() => {
    if (!price || error || !currencyAmount) return null

    try {
      return price.quote(currencyAmount)
    } catch (error) {
      return null
    }
  }, [currencyAmount, error, price])
}

export function useUSDValue(currencyAmount?: CurrencyAmount | null, selectedTrade?: Trade): CurrencyAmount | null {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount || undefined, chainId)

  const price = useUSDPrice((wrappedCurrencyToken as CurrencyAmount) || undefined, selectedTrade)

  return useGetPriceQuote({ price: price || null, error: null, currencyAmount: wrappedCurrencyToken as CurrencyAmount })
}

export function useCoingeckoUSDValue(currencyAmount: CurrencyAmount | undefined): CurrencyAmount | null {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount || undefined, chainId)

  const coingeckoUsdPrice = useCoingeckoUSDPrice(wrappedCurrencyToken?.currency)

  return useGetPriceQuote({ ...coingeckoUsdPrice, currencyAmount: wrappedCurrencyToken as CurrencyAmount })
}

export function useHigherUSDValue(
  currencyAmount: CurrencyAmount | undefined,
  selectedTrade?: Trade
): CurrencyAmount | null {
  const USDPrice = useUSDValue(currencyAmount, selectedTrade)
  const coingeckoUSDPrice = useCoingeckoUSDValue(currencyAmount)

  return coingeckoUSDPrice || USDPrice
}
