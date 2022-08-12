import { UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { TradeHistory } from './trades.types'

export const selectLoading = createSelector([(state: AppState) => state.trades.sources], sources => {
  const adaptersLoadingState = Object.values(sources).map(({ loading }) => loading)

  const isNewPair = adaptersLoadingState.every(loading => loading)
  const isLoading = adaptersLoadingState.includes(true)

  return {
    isLoading,
    isNewPair,
  }
})

export const selectAllSwaprTrades = createSelector(
  [(state: AppState) => state.trades.sources.swapr, (state: AppState) => state.trades.pair],
  (swaprTrades, { fromTokenAddress }) => {
    if (swaprTrades && swaprTrades.transactions?.pair) {
      const { burns, mints, swaps, token0, token1 } = swaprTrades.transactions.pair

      const logoKey = UniswapV2RoutablePlatform.SWAPR.name

      const swaprLiquidityHistory: TradeHistory[] = [...burns, ...mints].map(trade => {
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

      const swaprTradeHistory: TradeHistory[] = swaps.map(trade => {
        const {
          amount0In,
          amount0Out,
          amount1In,
          amount1Out,
          transaction: { id },
          timestamp,
          amountUSD,
        } = trade

        return {
          transactionId: id,
          amountIn: Number(amount0In) > Number(amount1In) ? amount0In : amount1In,
          amountOut: Number(amount0Out) > Number(amount1Out) ? amount0Out : amount1Out,
          timestamp,
          amountUSD,
          isSell:
            (token0.id.toLowerCase() === fromTokenAddress?.toLowerCase() && Number(amount0In) > Number(amount1In)) ||
            (token1.id.toLowerCase() === fromTokenAddress?.toLowerCase() && Number(amount1In) > Number(amount0In)),
          logoKey,
        }
      })

      return {
        swaprTradeHistory,
        swaprLiquidityHistory,
      }
    }

    return {
      swaprTradeHistory: [],
      swaprLiquidityHistory: [],
    }
  }
)
