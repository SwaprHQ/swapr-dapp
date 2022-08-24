import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectHasMoreData } from './trades.selectors'
import { TradeHistory } from './trades.types'

export const useAllTrades = (): {
  tradeHistory: TradeHistory[]
  liquidityHistory: TradeHistory[]
  hasMore: boolean
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
