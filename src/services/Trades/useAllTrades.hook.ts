import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectLoading } from './trades.selectors'
import { TradeHistory } from './trades.types'

export const useAllTrades = (): {
  isLoading: boolean
  isNewPair: boolean
  allTradeHistory: TradeHistory[]
  allLiquidityHistory: TradeHistory[]
} => {
  const { tradeHistory, liquidityHistory } = useSelector(selectAllSwaprTrades)
  const { isLoading, isNewPair } = useSelector(selectLoading)

  const allTradeHistory = [...tradeHistory]
  const allLiquidityHistory = [...liquidityHistory]

  return {
    isLoading,
    isNewPair,
    allTradeHistory,
    allLiquidityHistory,
  }
}
