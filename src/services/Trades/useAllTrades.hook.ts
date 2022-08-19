import { useSelector } from 'react-redux'

import { selectAllSwaprTrades, selectLoading } from './trades.selectors'
import { TradeHistory } from './trades.types'

export const useAllTrades = (): {
  isLoading: boolean
  isNewPair: boolean
  tradeHistory: TradeHistory[]
  liquidityHistory: TradeHistory[]
} => {
  const { swaprTradeHistory, swaprLiquidityHistory } = useSelector(selectAllSwaprTrades)
  const { isLoading, isNewPair } = useSelector(selectLoading)

  const tradeHistory = [...swaprTradeHistory]
  const liquidityHistory = [...swaprLiquidityHistory]

  return {
    isLoading,
    isNewPair,
    tradeHistory,
    liquidityHistory,
  }
}
