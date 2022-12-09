import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { useWeb3ReactCore } from '../../hooks/useWeb3ReactCore'
import { Transaction, TransactionStatus } from '../../pages/Account/Account.types'
import { formattedTransactions as formatTransactions } from '../../pages/Account/accountUtils'
import { useAllBridgeTransactions, useAllSwapTransactions } from '../../state/transactions/hooks'
import { sortByTimeStamp } from '../../utils/sortByTimestamp'
import { AdvancedViewTransaction } from './advancedTradingView.types'
import {
  selectAllDataFromAdapters,
  selectHasMoreData,
  selectUniswapV3AllData,
} from './store/advancedTradingView.selectors'

export const useAllTrades = (): {
  transactions: Transaction[]
  tradeHistory: Required<AdvancedViewTransaction>[]
  liquidityHistory: AdvancedViewTransaction[]
  hasMore: { hasMoreActivity: boolean; hasMoreTrades: boolean }
} => {
  const { account } = useWeb3ReactCore()
  const hasMore = useSelector(selectHasMoreData)
  const { uniswapV3LiquidityHistory, uniswapV3TradeHistory } = useSelector(selectUniswapV3AllData)
  const { baseAdapterTradeHistory, baseAdapterLiquidityHistory } = useSelector(selectAllDataFromAdapters)

  const allSwapTransactions = useAllSwapTransactions()

  const allSwapBridgeTransactions = useAllBridgeTransactions(true).filter(
    transaction => transaction.bridgeId === 'socket' && transaction.from.token !== transaction.to.token
  )

  const transactions = useMemo(() => {
    if (account) {
      const formattedTransactions = formatTransactions(allSwapTransactions, allSwapBridgeTransactions, false, account)

      const pendingTransactions = formattedTransactions
        .filter(
          tx =>
            tx.status.toUpperCase() === TransactionStatus.PENDING ||
            tx.status.toUpperCase() === TransactionStatus.REDEEM
        )
        .splice(0, 5)

      if (pendingTransactions.length === 5) return pendingTransactions

      const formattedTransactionsWithoutPending = formattedTransactions
        .filter(
          transaction =>
            transaction.status.toUpperCase() !== TransactionStatus.PENDING &&
            transaction.status.toUpperCase() !== TransactionStatus.REDEEM
        )
        .splice(0, 5 - pendingTransactions.length)

      return [...pendingTransactions, ...formattedTransactionsWithoutPending]
    }

    return []
  }, [account, allSwapBridgeTransactions, allSwapTransactions])

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
