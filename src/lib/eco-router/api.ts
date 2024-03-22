import { AddressZero } from '@ethersproject/constants'
import { Provider } from '@ethersproject/providers'
import {
  CoWTrade,
  CurveTrade,
  getAllCommonUniswapV2Pairs,
  OneInchTrade,
  Percent,
  RoutablePlatform,
  Token,
  Trade,
  TradeType,
  UniswapTrade,
  UniswapV2RoutablePlatform,
  UniswapV2Trade,
  VelodromeTrade,
  ZeroXTrade,
  SwaprV3Trade,
  SushiswapTrade,
  OpenoceanTrade,
} from '@swapr/sdk'

// Low-level API for Uniswap V2
import { getSupportedPlatformsByChainId } from './platforms'
// Types
import {
  EcoRouterBestExactInParams,
  EcoRouterBestExactOutParams,
  EcoRouterResults,
  EcoRouterSourceOptionsParams,
} from './types'

const FIVE_PERCENT = new Percent('5', '100')

/**
 * Sort trades by price in descending order. Best trades are first.
 * @param trades list of trades
 * @returns sorted list of trades in descending order
 */
export function sortTradesByExecutionPrice(trades: Trade[]) {
  return trades.sort((a, b) => {
    if (a === undefined || a === null) {
      return 1
    }
    if (b === undefined || b === null) {
      return -1
    }

    const aExecutionPrice = a instanceof CoWTrade ? a.executionPriceWithoutFee : a.executionPrice
    const bExecutionPrice = b instanceof CoWTrade ? b.executionPriceWithoutFee : b.executionPrice

    if (aExecutionPrice.lessThan(bExecutionPrice)) {
      return 1
    } else if (aExecutionPrice.equalTo(bExecutionPrice)) {
      return 0
    } else {
      return -1
    }
  })
}

/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
export async function getExactIn(
  { currencyAmountIn, currencyOut, maximumSlippage, receiver = AddressZero, user }: EcoRouterBestExactInParams,
  { uniswapV2 }: EcoRouterSourceOptionsParams,
  provider?: Provider
): Promise<EcoRouterResults> {
  // Error list
  const errors: any[] = []
  // Derive the chainId from the token in or out
  const chainId = (currencyAmountIn.currency as Token).chainId ?? (currencyOut as Token).chainId

  if (!chainId) {
    return {
      errors: [new Error('Unsupported chain')],
      trades: [],
    }
  }

  const supportedEcoRouterPlatforms = getSupportedPlatformsByChainId(chainId)

  const ecoRouterTradeList = await Promise.all(
    supportedEcoRouterPlatforms.map(async platform => {
      try {
        // Uniswap v2
        if (platform instanceof UniswapV2RoutablePlatform) {
          const pairs = await getAllCommonUniswapV2Pairs({
            currencyA: currencyAmountIn.currency,
            currencyB: currencyOut,
            platform,
            provider,
          })

          return (
            UniswapV2Trade.computeTradesExactIn({
              currencyAmountIn,
              currencyOut,
              maximumSlippage,
              maxHops: {
                maxHops: uniswapV2.useMultihops ? 3 : 1,
                maxNumResults: 1,
              },
              pairs,
            })[0] ?? undefined
          )
        }
        // Uniswap v3
        if (platform.name === RoutablePlatform.UNISWAP.name) {
          return UniswapTrade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }
        // Swapr v3
        if (platform.name === RoutablePlatform.SWAPR_V3.name) {
          return SwaprV3Trade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }
        // Sushiswap
        if (platform.name === RoutablePlatform.SUSHISWAP.name) {
          return SushiswapTrade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }
        // Openocean
        if (platform.name === RoutablePlatform.OPENOCEAN.name) {
          return OpenoceanTrade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }
        // Curve
        if (platform.name === RoutablePlatform.CURVE.name) {
          return CurveTrade.bestTradeExactIn({
            currencyAmountIn,
            currencyOut,
            maximumSlippage,
            receiver,
          })
        }
        // ZeroX
        if (platform.name === RoutablePlatform.ZEROX.name) {
          return ZeroXTrade.bestTradeExactIn(currencyAmountIn, currencyOut, maximumSlippage)
        }
        // COW
        if (platform.name === RoutablePlatform.COW.name) {
          return CoWTrade.bestTradeExactIn({
            currencyAmountIn,
            currencyOut,
            maximumSlippage,
            receiver,
            user,
          })
        }
        // Velodrome
        if (platform.name === RoutablePlatform.VELODROME.name) {
          return VelodromeTrade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }

        if (platform.name === RoutablePlatform.ONE_INCH.name) {
          return OneInchTrade.getQuote({
            quoteCurrency: currencyOut,
            amount: currencyAmountIn,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_INPUT,
          })
        }
      } catch (error) {
        errors.push(error)
        return undefined
      }
    })
  )

  // remove undefined values and hight impact prices
  const unsortedTrades = ecoRouterTradeList
    .filter(trade => trade !== undefined || trade !== null)
    .filter(trade => trade?.priceImpact.lessThan(FIVE_PERCENT)) as Trade[]

  // Return the list of sorted trades
  return {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades),
  }
}

/**
 * Low-level function to fetch from Eco Router sources
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
export async function getExactOut(
  { currencyAmountOut, currencyIn, maximumSlippage, receiver = AddressZero, user }: EcoRouterBestExactOutParams,
  { uniswapV2 }: EcoRouterSourceOptionsParams,
  provider?: Provider
): Promise<EcoRouterResults> {
  // Error list
  const errors: any[] = []
  // Derive the chainId from the token in or out
  const chainId = (currencyAmountOut.currency as Token).chainId ?? (currencyIn as Token).chainId

  if (!chainId) {
    return {
      errors: [new Error('Unsupported chain')],
      trades: [],
    }
  }

  const supportedEcoRouterPlatforms = getSupportedPlatformsByChainId(chainId)

  const ecoRouterTradeList = await Promise.all(
    supportedEcoRouterPlatforms.map(async platform => {
      try {
        // Uniswap v2
        if (platform instanceof UniswapV2RoutablePlatform) {
          const pairs = await getAllCommonUniswapV2Pairs({
            currencyA: currencyAmountOut.currency,
            currencyB: currencyIn,
            platform,
            provider,
          })
          return (
            UniswapV2Trade.computeTradesExactOut({
              currencyAmountOut,
              currencyIn,
              maximumSlippage,
              maxHops: {
                maxHops: uniswapV2.useMultihops ? 3 : 1,
                maxNumResults: 1,
              },
              pairs,
            })[0] ?? undefined
          )
        }
        // Uniswap v3
        if (platform.name === RoutablePlatform.UNISWAP.name) {
          return UniswapTrade.getQuote({
            quoteCurrency: currencyIn,
            amount: currencyAmountOut,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_OUTPUT,
          })
        }
        // Curve
        if (platform.name === RoutablePlatform.CURVE.name) {
          return CurveTrade.bestTradeExactOut({
            currencyAmountOut,
            currencyIn,
            maximumSlippage,
            receiver,
          })
        }
        // ZeroX
        if (platform.name === RoutablePlatform.ZEROX.name) {
          return ZeroXTrade.bestTradeExactOut(currencyIn, currencyAmountOut, maximumSlippage)
        }
        // COW
        if (platform.name === RoutablePlatform.COW.name) {
          return CoWTrade.bestTradeExactOut({
            currencyAmountOut,
            currencyIn,
            maximumSlippage,
            receiver,
            user,
          })
        }
        if (platform.name === RoutablePlatform.VELODROME.name) {
          return VelodromeTrade.getQuote({
            quoteCurrency: currencyIn,
            amount: currencyAmountOut,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_OUTPUT,
          })
        }
        if (platform.name === RoutablePlatform.SWAPR_V3.name) {
          return SwaprV3Trade.getQuote({
            quoteCurrency: currencyIn,
            amount: currencyAmountOut,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_OUTPUT,
          })
        }
        // Trade out doesn't yet work on OneInch
        /* if (platform.name === RoutablePlatform.ONE_INCH.name) {
          return OneInchTrade.getQuote({
            quoteCurrency: currencyIn,
            amount: currencyAmountOut,
            maximumSlippage,
            recipient: receiver,
            tradeType: TradeType.EXACT_OUTPUT,
          })
        } */
      } catch (error) {
        errors.push(error)
        return undefined
      }
    })
  )

  // remove undefined values and hight impact prices
  const unsortedTrades = ecoRouterTradeList
    .filter(trade => trade !== undefined || trade !== null)
    .filter(trade => trade?.priceImpact.lessThan(FIVE_PERCENT)) as Trade[]

  // Return the list of sorted trades
  return {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades),
  }
}
