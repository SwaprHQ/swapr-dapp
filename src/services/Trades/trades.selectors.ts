import { UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { TradeHistory } from './trades.types'

//check if any adapter can fetch more data
export const selectHasMoreData = createSelector([(state: AppState) => state.trades.sources], sources =>
  Object.values(sources)
    .map(adapter => adapter.fetchDetails.hasMore)
    .includes(true)
)

export const selectAllSwaprTrades = createSelector(
  [(state: AppState) => state.trades.sources.swapr, (state: AppState) => state.trades.pair],
  (swaprTrades, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken)
      return {
        swaprTradeHistory: [],
        swaprLiquidityHistory: [],
      }

    const sortedTokens = inputToken?.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]
    const [token0, token1] = sortedTokens

    if (swaprTrades && swaprTrades.transactions?.pair) {
      const { burns, mints, swaps } = swaprTrades.transactions.pair

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
          amountToken0: Number(amount0In) > Number(amount0Out) ? amount0In : amount0Out,
          amountToken1: Number(amount1In) > Number(amount1Out) ? amount1In : amount1Out,
          addressToken0: token0.address,
          addressToken1: token1.address,
          timestamp,
          amountUSD,
          isSell:
            (token0.address.toLowerCase() === inputToken.address?.toLowerCase() &&
              Number(amount0In) > Number(amount1In)) ||
            (token1.address.toLowerCase() === inputToken.address?.toLowerCase() &&
              Number(amount1In) > Number(amount0In)),
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
