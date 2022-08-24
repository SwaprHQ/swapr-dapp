import { UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AdvancedViewTradeHistory } from './advancedTradingView.types'

//check if any adapter can fetch more data
export const selectHasMoreData = createSelector([(state: AppState) => state.advancedTradingView.adapters], adapters => {
  const hasMoreTrades = Object.values(adapters)
    .map(adapter => adapter.fetchDetails.hasMoreTrades)
    .includes(true)

  const hasMoreActivity = Object.values(adapters)
    .map(adapter => adapter.fetchDetails.hasMoreActivity)
    .includes(true)

  return { hasMoreTrades, hasMoreActivity }
})

export const selectAllSwaprTrades = createSelector(
  [(state: AppState) => state.advancedTradingView.adapters.swapr, (state: AppState) => state.advancedTradingView.pair],
  ({ pair }, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken) {
      return {
        swaprTradeHistory: [],
        swaprLiquidityHistory: [],
      }
    }

    const [token0, token1] = inputToken.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]

    const { burnsAndMints, swaps } = pair

    const logoKey = UniswapV2RoutablePlatform.SWAPR.name

    const swaprLiquidityHistory: AdvancedViewTradeHistory[] = burnsAndMints.map(trade => {
      const {
        transaction: { id },
        amount0,
        amount1,
        timestamp,
      } = trade
      return {
        transactionId: id,
        amountIn: `${amount0} ${token0.symbol}`,
        amountOut: `${amount1} ${token1.symbol}`,
        timestamp,
        logoKey,
      }
    })

    const swaprTradeHistory: AdvancedViewTradeHistory[] = swaps.map(trade => {
      const {
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
        transaction: { id },
        timestamp,
        amountUSD,
      } = trade

      const normalizedValues = {
        amount0In: Number(amount0In),
        amount0Out: Number(amount0Out),
        amount1In: Number(amount1In),
        amount1Out: Number(amount1Out),
        token0Address: token0.address.toLowerCase(),
        token1Address: token1.address.toLowerCase(),
        inputTokenAddress: inputToken.address.toLowerCase(),
        outputTokenAddress: outputToken.address.toLowerCase(),
      }

      return {
        transactionId: id,
        amountIn:
          normalizedValues.inputTokenAddress === normalizedValues.token0Address
            ? Math.max(normalizedValues.amount0In, normalizedValues.amount0Out).toString()
            : Math.max(normalizedValues.amount1In, normalizedValues.amount1Out).toString(),
        amountOut:
          normalizedValues.outputTokenAddress === normalizedValues.token0Address
            ? Math.max(normalizedValues.amount0In, normalizedValues.amount0Out).toString()
            : Math.max(normalizedValues.amount1In, normalizedValues.amount1Out).toString(),
        timestamp,
        amountUSD,
        isSell:
          (normalizedValues.token0Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount0In > normalizedValues.amount1In) ||
          (normalizedValues.token1Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount1In > normalizedValues.amount0In),
        logoKey,
      }
    })

    return {
      swaprTradeHistory,
      swaprLiquidityHistory,
    }
  }
)
