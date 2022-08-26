import { Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

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

export const sortsBeforeTokens = (inputToken: Token, outputToken: Token) => {
  return inputToken.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]
}

export const selectAllSwaprTrades = createSelector(
  [(state: AppState) => state.advancedTradingView.adapters.swapr, (state: AppState) => state.advancedTradingView.pair],
  ({ pair }, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken) {
      return {
        swaprTradeHistory: [],
        swaprLiquidityHistory: [],
      }
    }

    const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

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

      const amount0 = Math.max(normalizedValues.amount0In, normalizedValues.amount0Out)
      const amount1 = Math.max(normalizedValues.amount1In, normalizedValues.amount1Out)

      return {
        transactionId: id,
        amountIn: (normalizedValues.inputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        amountOut: (normalizedValues.outputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        price: (normalizedValues.outputTokenAddress === normalizedValues.token0Address
          ? (1 / Number(amount0)) * Number(amount1)
          : (1 / Number(amount1)) * Number(amount0)
        ).toString(),
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
