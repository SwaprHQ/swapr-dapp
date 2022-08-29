import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectHasMoreData } from './advancedTradingView.selectors'
import { AdvancedViewTransaction } from './advancedTradingView.types'

export const useAllTrades = (): {
  tradeHistory: AdvancedViewTransaction[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { swaprTradeHistory, swaprLiquidityHistory } = useSelector(selectAllSwaprTrades)

  const hasMore = useSelector(selectHasMoreData)

  const tradeHistory = [...swaprTradeHistory]
  const liquidityHistory = [...swaprLiquidityHistory]

  return {
    tradeHistory,
    liquidityHistory,
    hasMore,
  }
}
