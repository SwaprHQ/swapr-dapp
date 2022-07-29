import { createSelector } from '@reduxjs/toolkit'
import { AppState } from 'state'

export type Trade = {
  transactionId: string
  amountUSD: string
  amount0: string
  amount1: string
  timestamp: string
}

// loading
export const selectStateLoading = createSelector([(state: AppState) => state.trades.loading], loadingState =>
  Object.values(loadingState).includes(true)
)

// trades
export const selectAllSwaprTrades = createSelector([(state: AppState) => state.trades.swapr], swaprTrades => {
  if (swaprTrades) {
    const {
      pair: { burns, mints, swaps, token0, token1 },
    } = swaprTrades

    const liquidityHistory: Trade[] = [...burns, ...mints].map(trade => {
      const {
        transaction: { id },
        amount0,
        amount1,
        amountUSD,
        timestamp,
      } = trade
      return {
        transactionId: id,
        amountUSD,
        amount0: `${amount0} ${token0.symbol}`,
        amount1: `${amount1} ${token1.symbol}`,
        timestamp,
      }
    })

    const tradeHistory: Trade[] = swaps.map(trade => {
      const {
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
        amountUSD,
        transaction: { id },
        timestamp,
      } = trade

      const amount0 = Number(amount0In) === 0 ? `${amount1In} ${token1.symbol}` : `${amount0In} ${token0.symbol}`

      const amount1 = Number(amount0Out) === 0 ? `${amount1Out} ${token1.symbol}` : `${amount0Out} ${token0.symbol}`

      return {
        transactionId: id,
        amountUSD,
        amount0,
        amount1,
        timestamp,
      }
    })

    return {
      liquidityHistory,
      tradeHistory,
    }
  }

  return {
    liquidityHistory: [],
    tradeHistory: [],
  }
})
