import { Trade, ChainId, UniswapV2Trade, CurveTrade, GnosisProtocolTrade, Token } from '@swapr/sdk'
// Low-level API for Uniswap V2
import { getAllCommonPairs } from '@swapr/sdk/dist/entities/trades/uniswap-v2/contracts'

import { getUniswapV2PlatformList } from './platforms'
// Types
import type {
  EcoRouterBestExactInParams,
  EcoRouterResults,
  EcoRouterSourceOptionsParams,
  EcoRouterBestExactOutParams
} from './types'

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

    if (a.executionPrice.lessThan(b.executionPrice)) {
      return 1
    } else if (a.executionPrice.equalTo(b.executionPrice)) {
      return 0
    } else {
      return -1
    }
  })
}

/**
 * Low-level function to fetch from Eco Router sources
 * @returns {EcoRouterResults} List of unsorted trade sources
 */
export async function getExactIn(
  { currencyAmountIn, currencyOut, maximumSlippage, receiver }: EcoRouterBestExactInParams,
  { uniswapV2 }: EcoRouterSourceOptionsParams
): Promise<EcoRouterResults> {
  // Error list
  const errors: any[] = []
  // Derive the chainId from the token in or out
  const chainId = (currencyAmountIn.currency as Token).chainId ?? (currencyOut as Token).chainId

  // Uniswap V2
  // Get the list of Uniswap V2 platform that support current chain
  const uniswapV2PlatformList = getUniswapV2PlatformList(chainId as ChainId)

  const uniswapV2TradesList = uniswapV2PlatformList.map(async platform => {
    try {
      const pairs = await getAllCommonPairs(currencyAmountIn.currency, currencyOut, platform)
      return (
        UniswapV2Trade.computeTradeExactIn({
          currencyAmountIn,
          currencyOut,
          maximumSlippage,
          maxHops: {
            maxHops: uniswapV2.useMultihops ? 3 : 1,
            maxNumResults: 1
          },
          pairs
        })[0] ?? undefined
      )
    } catch (error) {
      errors.push(error)
      return undefined
    }
  })

  // Curve
  const curveTrade = new Promise<CurveTrade | undefined>(async resolve => {
    CurveTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut,
      maximumSlippage
    })
      .then(resolve)
      .catch(error => {
        errors.push(error)
        resolve(undefined)
      })
  })

  // Gnosis Protocol V2
  const gnosisProtocolTrade = new Promise<GnosisProtocolTrade | undefined>(async resolve => {
    GnosisProtocolTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut,
      maximumSlippage,
      receiver
    })
      .then(resolve)
      .catch(error => {
        resolve(undefined)
        console.log(error)
      })
  })

  // Wait for all promises to resolve, and
  // remove undefined values
  const unsortedTrades = (await Promise.all([
    ...(uniswapV2TradesList as any),
    curveTrade,
    gnosisProtocolTrade
  ]).then(trade => trade.filter(trade => trade !== undefined))) as Trade[]

  // Return the list of sorted trades
  return {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades)
  }
}

/**
 * Low-level function to fetch from Eco Router sources
 * @returns {EcoRouterResults} List of unsorted trade sources
 */
export async function getExactOut(
  { currencyAmountOut, currencyIn, maximumSlippage, receiver }: EcoRouterBestExactOutParams,
  { uniswapV2 }: EcoRouterSourceOptionsParams
): Promise<EcoRouterResults> {
  // Error list
  const errors: any[] = []
  // Derive the chainId from the token in or out
  const chainId = (currencyAmountOut.currency as Token).chainId ?? (currencyIn as Token).chainId

  // Uniswap V2
  // Get the list of Uniswap V2 platform that support current chain
  const uniswapV2PlatformList = getUniswapV2PlatformList(chainId as ChainId)

  const uniswapV2TradesList = uniswapV2PlatformList.map(async platform => {
    try {
      const pairs = await getAllCommonPairs(currencyAmountOut.currency, currencyIn, platform)
      return (
        UniswapV2Trade.computeTradeExactOut({
          currencyAmountOut,
          currencyIn,
          maximumSlippage,
          maxHops: {
            maxHops: uniswapV2.useMultihops ? 3 : 1,
            maxNumResults: 1
          },
          pairs
        })[0] ?? undefined
      )
    } catch (error) {
      errors.push(error)
      return undefined
    }
  })

  // Curve
  const curveTrade = new Promise<CurveTrade | undefined>(async resolve => {
    CurveTrade.bestTradeExactOut({
      currencyAmountOut,
      currencyIn,
      maximumSlippage
    })
      .then(resolve)
      .catch(error => {
        errors.push(error)
        resolve(undefined)
      })
  })

  // Gnosis Protocol V2
  const gnosisProtocolTrade = new Promise<GnosisProtocolTrade | undefined>(async resolve => {
    GnosisProtocolTrade.bestTradeExactOut({
      currencyAmountOut,
      currencyIn,
      maximumSlippage,
      receiver
    })
      .then(resolve)
      .catch(error => {
        resolve(undefined)
        console.log(error)
      })
  })

  // Wait for all promises to resolve, and
  // remove undefined values
  const unsortedTrades = (await Promise.all([
    ...(uniswapV2TradesList as any),
    curveTrade,
    gnosisProtocolTrade
  ]).then(trade => trade.filter(trade => trade !== undefined))) as Trade[]

  // Return the list of sorted trades
  return {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades)
  }
}
