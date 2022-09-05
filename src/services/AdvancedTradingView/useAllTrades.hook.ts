import { useSelector } from 'react-redux'

import {
  selectAllDataFromAdapters,
  selectHasMoreData,
  selectUniswapV3AllDataFromAdapters,
} from './advancedTradingView.selectors'
import { AdvancedViewTransaction } from './advancedTradingView.types'

export const useAllTrades = (): {
  tradeHistory: Required<AdvancedViewTransaction>[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { baseAdapterTradeHistory, baseAdapterLiquidityHistory } = useSelector(selectAllDataFromAdapters)
  const { uniswapV3LiquidityHistory, uniswapV3TradeHistory } = useSelector(selectUniswapV3AllDataFromAdapters)

  const hasMore = useSelector(selectHasMoreData)

  const tradeHistory = [...baseAdapterTradeHistory, ...uniswapV3TradeHistory]
  const liquidityHistory = [...baseAdapterLiquidityHistory, ...uniswapV3LiquidityHistory]

  return {
    tradeHistory,
    liquidityHistory,
    hasMore,
  }
}
