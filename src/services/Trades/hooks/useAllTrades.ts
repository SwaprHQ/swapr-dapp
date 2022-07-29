import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectStateLoading, Trade } from '../store/trades.selectors'

export const useAllTrades = (): { allTradeHistory: Trade[]; allLiquidityHistory: Trade[]; isLoading: boolean } => {
  const { tradeHistory, liquidityHistory } = useSelector(selectAllSwaprTrades)
  const isLoading = useSelector(selectStateLoading)

  const allTradeHistory = [...tradeHistory]
  const allLiquidityHistory = [...liquidityHistory]

  return {
    allTradeHistory,
    allLiquidityHistory,
    isLoading,
  }
}
