import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, Trade } from '../store/trades.selectors'

export const useAllTrades = (): { allTradeHistory: Trade[]; allLiquidityHistory: Trade[] } => {
  const { tradeHistory, liquidityHistory } = useSelector(selectAllSwaprTrades)

  const allTradeHistory = [...tradeHistory]
  const allLiquidityHistory = [...liquidityHistory]

  return {
    allTradeHistory,
    allLiquidityHistory,
  }
}
