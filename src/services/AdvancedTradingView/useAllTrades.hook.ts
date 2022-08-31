import { useSelector } from 'react-redux'

import { selectAllDataFromAdapters, selectHasMoreData } from './advancedTradingView.selectors'
import { AdvancedViewTransaction } from './advancedTradingView.types'

export const useAllTrades = (): {
  tradeHistory: Required<AdvancedViewTransaction>[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { baseAdapterTradeHistory, baseAdapterLiquidityHistory } = useSelector(selectAllDataFromAdapters)

  const hasMore = useSelector(selectHasMoreData)

  const tradeHistory = [...baseAdapterTradeHistory]
  const liquidityHistory = [...baseAdapterLiquidityHistory]

  return {
    tradeHistory,
    liquidityHistory,
    hasMore,
  }
}
