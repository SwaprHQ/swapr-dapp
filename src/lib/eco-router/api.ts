import { AddressZero } from '@ethersproject/constants'
import { Provider } from '@ethersproject/providers'
import {
  CurveTrade,
  getAllCommonUniswapV2Pairs,
  getAllCommonUniswapV2PairsFromSubgraph,
  Pair,
  RoutablePlatform,
  Token,
  Trade,
  TradeType,
  UniswapTrade,
  UniswapV2Trade,
} from '@swapr/sdk'
// Low-level API for Uniswap V2

import { getUniswapV2PlatformList } from './platforms'
// Types
import {
  EcoRouterBestExactInParams,
  EcoRouterBestExactOutParams,
  EcoRouterResults,
  EcoRouterSourceOptionsParams,
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
 * @returns {Promise<EcoRouterResults>} List of unsorted trade sources
 */
export async function getExactIn(
  { currencyAmountIn, currencyOut, maximumSlippage, receiver = AddressZero }: EcoRouterBestExactInParams,
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

  // Uniswap V2
  // Get the list of Uniswap V2 platform that support current chain
  const uniswapV2PlatformList = getUniswapV2PlatformList(chainId)

  const uniswapV2TradesList = uniswapV2PlatformList.map(async platform => {
    try {
      let pairs: Pair[] = []

      const getAllCommonUniswapV2PairsParams = {
        currencyA: currencyAmountIn.currency,
        currencyB: currencyOut,
        platform,
        provider,
      }

      if (platform.subgraphEndpoint[chainId] !== undefined) {
        pairs = await getAllCommonUniswapV2PairsFromSubgraph(getAllCommonUniswapV2PairsParams)
      } else {
        pairs = await getAllCommonUniswapV2Pairs(getAllCommonUniswapV2PairsParams)
      }

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
    } catch (error) {
      errors.push(error)
      return undefined
    }
  })

  const uniswapTrade = new Promise<UniswapTrade | undefined>(resolve => {
    if (!RoutablePlatform.UNISWAP.supportsChain(chainId)) {
      return resolve(undefined)
    }

    UniswapTrade.getQuote({
      quoteCurrency: currencyOut,
      amount: currencyAmountIn,
      maximumSlippage,
      recipient: receiver,
      tradeType: TradeType.EXACT_INPUT,
    })
      .then(res => resolve(res ? res : undefined))
      .catch(error => {
        console.error(error)
        errors.push(error)
        resolve(undefined)
      })
  })

  // Curve
  const curveTrade = new Promise<CurveTrade | undefined>(async resolve => {
    if (!RoutablePlatform.CURVE.supportsChain(chainId)) {
      return resolve(undefined)
    }

    CurveTrade.bestTradeExactIn(
      {
        currencyAmountIn,
        currencyOut,
        maximumSlippage,
        receiver,
      },
      provider
    )
      .then(resolve)
      .catch(error => {
        errors.push(error)
        resolve(undefined)
      })
  })

  // Wait for all promises to resolve, and
  // remove undefined values
  const unsortedTradesWithUndefined = await Promise.all<Trade | undefined>([
    ...uniswapV2TradesList,
    curveTrade,
    uniswapTrade,
  ])
  const unsortedTrades = unsortedTradesWithUndefined.filter((trade): trade is Trade => !!trade)

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
  { currencyAmountOut, currencyIn, maximumSlippage, receiver = AddressZero }: EcoRouterBestExactOutParams,
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

  // Uniswap V2
  // Get the list of Uniswap V2 platform that support current chain
  const uniswapV2PlatformList = getUniswapV2PlatformList(chainId)

  const uniswapV2TradesList = uniswapV2PlatformList.map(async platform => {
    try {
      let pairs: Pair[] = []

      const getAllCommonUniswapV2PairsParams = {
        currencyA: currencyAmountOut.currency,
        currencyB: currencyIn,
        platform,
        provider,
      }

      if (platform.subgraphEndpoint[chainId] !== undefined) {
        pairs = await getAllCommonUniswapV2PairsFromSubgraph(getAllCommonUniswapV2PairsParams)
      } else {
        pairs = await getAllCommonUniswapV2Pairs(getAllCommonUniswapV2PairsParams)
      }

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
    } catch (error) {
      errors.push(error)
      return undefined
    }
  })

  // Uniswap v2 and v3
  const uniswapTrade = new Promise<UniswapTrade | undefined>(resolve => {
    if (!RoutablePlatform.UNISWAP.supportsChain(chainId)) {
      return resolve(undefined)
    }

    UniswapTrade.getQuote({
      quoteCurrency: currencyIn,
      amount: currencyAmountOut,
      maximumSlippage,
      recipient: receiver,
      tradeType: TradeType.EXACT_OUTPUT,
    })
      .then(res => resolve(res ? res : undefined))
      .catch(error => {
        console.error(error)
        errors.push(error)
        resolve(undefined)
      })
  })

  // Wait for all promises to resolve, and
  // remove undefined values
  const unsortedTradesWithUndefined = await Promise.all<Trade | undefined>([...uniswapV2TradesList, uniswapTrade])
  const unsortedTrades = unsortedTradesWithUndefined.filter((trade): trade is Trade => !!trade)

  // Return the list of sorted trades
  return {
    errors,
    trades: sortTradesByExecutionPrice(unsortedTrades),
  }
}
