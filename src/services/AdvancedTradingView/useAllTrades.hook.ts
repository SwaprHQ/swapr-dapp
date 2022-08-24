import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectHasMoreData } from './advancedTradingView.selectors'
import { AdvancedViewTradeHistory } from './advancedTradingView.types'

export const useAllTrades = (): {
  tradeHistory: AdvancedViewTradeHistory[]
  liquidityHistory: AdvancedViewTradeHistory[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { swaprTradeHistory, swaprLiquidityHistory } = useSelector(selectAllSwaprTrades)

  const { hasMoreActivity, hasMoreTrades } = useSelector(selectHasMoreData)

  const tradeHistory = [...swaprTradeHistory]
  const liquidityHistory = [...swaprLiquidityHistory]

  return {
    tradeHistory,
    liquidityHistory,
    hasMore: { hasMoreActivity, hasMoreTrades },
  }
}
