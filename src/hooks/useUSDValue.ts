import { Token, Trade, currencyEquals, Price, CurrencyAmount, Currency, Fraction, JSBI, TEN, ChainId } from '@swapr/sdk'
import { useTradeExactInAllPlatforms } from './Trades'
import { USDC, DAI } from '../constants/index'
import { useActiveWeb3React } from './index'
import { useEffect, useMemo, useState } from 'react'
import { currencyId } from '../utils/currencyId'
import { tryParseAmount } from '../state/swap/hooks'
import { getUSDPriceQuote, toPriceInformation } from '../utils/coingecko'
import { wrappedCurrency, wrappedCurrencyAmount } from '../utils/wrappedCurrency'

const STABLECOIN_OUT: { [chainId: number]: Token } = {
  [ChainId.MAINNET]: DAI,
  [ChainId.ARBITRUM_ONE]: USDC[ChainId.ARBITRUM_ONE],
  [ChainId.XDAI]: USDC[ChainId.XDAI],
}

const FETCH_PRICE_INTERVAL = 15000

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
        numerator: '1',
      })

    const filterSelectedPlataforms = (trade: Trade | undefined) => {
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
        numerator,
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
            numerator: result.numerator,
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

export function useUSDValue(currencyAmount?: CurrencyAmount, selectedTrade?: Trade) {
  const { chainId = ChainId.MAINNET } = useActiveWeb3React()
  const wrappedCurrencyToken = wrappedCurrencyAmount(currencyAmount, chainId)

  const price = useUSDPrice(wrappedCurrencyToken, selectedTrade)

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
  trade,
}: {
  inputCurrencyAmount?: CurrencyAmount
  outputCurrencyAmount?: CurrencyAmount
  trade?: Trade
}) {
  const inputUSDPrice = useUSDValue(inputCurrencyAmount, trade)
  const outputUSDPrice = useUSDValue(outputCurrencyAmount, trade)

  const inputCoingeckoUSDPrice = useCoingeckoUSDValue(inputCurrencyAmount)
  const outputCoingeckoUSDPrice = useCoingeckoUSDValue(outputCurrencyAmount)

  return {
    fiatValueInput: inputCoingeckoUSDPrice || inputUSDPrice,
    fiatValueOutput: outputCoingeckoUSDPrice || outputUSDPrice,
    isFallbackFiatValueInput: !inputCoingeckoUSDPrice,
    isFallbackFiatValueOutput: !outputCoingeckoUSDPrice,
  }
}
