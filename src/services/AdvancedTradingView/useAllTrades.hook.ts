import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { Transaction } from '../../pages/Account/Account.types'
import { formattedTransactions as formatTransactions } from '../../pages/Account/accountUtils'
import { useAllBridgeTransactions, useAllSwapTransactions } from '../../state/transactions/hooks'
import { sortByTimeStamp } from '../../utils/sortByTimestamp'
import { selectAllDataFromAdapters, selectHasMoreData, selectUniswapV3AllData } from './advancedTradingView.selectors'
import { AdvancedViewTransaction } from './advancedTradingView.types'

export const useAllTrades = (): {
  transactions: Transaction[]
  tradeHistory: Required<AdvancedViewTransaction>[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { account } = useActiveWeb3React()
  const hasMore = useSelector(selectHasMoreData)
  const { uniswapV3LiquidityHistory, uniswapV3TradeHistory } = useSelector(selectUniswapV3AllData)
  const { baseAdapterTradeHistory, baseAdapterLiquidityHistory } = useSelector(selectAllDataFromAdapters)

  const allSwapTransactions = useAllSwapTransactions()
  const allBridgeTransactions = useAllBridgeTransactions()

  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!account) return

    const sortedTransactions = formatTransactions(allSwapTransactions, allBridgeTransactions, false, account)

    const pendingTransactions = formatTransactions(allSwapTransactions, allBridgeTransactions, true, account).splice(
      0,
      5
    )

    pendingTransactions.length === 5
      ? setTransactions(pendingTransactions)
      : setTransactions([...pendingTransactions, ...sortedTransactions.splice(0, 5 - pendingTransactions.length)])
  }, [allBridgeTransactions, allSwapTransactions, account])

  const tradeHistory = [...baseAdapterTradeHistory, ...uniswapV3TradeHistory].sort((firstTrade, secondTrade) =>
    sortByTimeStamp(firstTrade.timestamp, secondTrade.timestamp)
  )

  const liquidityHistory = [...baseAdapterLiquidityHistory, ...uniswapV3LiquidityHistory].sort(
    (firstTrade, secondTrade) => sortByTimeStamp(firstTrade.timestamp, secondTrade.timestamp)
  )

  return {
    transactions,
    tradeHistory,
    liquidityHistory,
    hasMore,
  }
}
