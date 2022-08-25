import { Token } from '@swapr/sdk'

import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectHasMoreData } from './advancedTradingView.selectors'
import { AdvancedViewTradeHistory } from './advancedTradingView.types'

export const useAllTrades = (): {
  tradeHistory: AdvancedViewTradeHistory[]
  liquidityHistory: AdvancedViewTradeHistory[]
  token0?: Token
  token1?: Token
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { swaprTradeHistory, swaprLiquidityHistory, token0, token1 } = useSelector(selectAllSwaprTrades)

  const { hasMoreActivity, hasMoreTrades } = useSelector(selectHasMoreData)

  const tradeHistory = [...swaprTradeHistory]
  const liquidityHistory = [...swaprLiquidityHistory]

  return {
    tradeHistory,
    liquidityHistory,
    token0,
    token1,
    hasMore: { hasMoreActivity, hasMoreTrades },
  }
}
