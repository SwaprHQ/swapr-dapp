import React, { FC, PropsWithChildren, useMemo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

import {
  Box,
  DiagramBox,
  HistoryBox,
  HistoryLiquidityBox,
  HistoryTrade,
  HistoryTradeBox,
  InfoBox,
  OrderBox,
  TitleColumn,
  TradeBox,
  TradesAndOrderBox,
} from './AdvancedSwapMode.styles'
import { TransactionHistory } from './AdvancedSwapMode.types'
import { formatDate } from './AdvancedSwapMode.utils'
import { usePair } from './usePair'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { burnsAndMints, swaps, inputTokenSymbol, outputTokenSymbol } = usePair()

  const memoizedAdvancedRealTimeChart = useMemo(() => {
    const symbol = inputTokenSymbol && outputTokenSymbol ? `${inputTokenSymbol}${outputTokenSymbol}` : 'USDCUSD'
    return (
      <div style={{ height: '95%' }}>
        <AdvancedRealTimeChart symbol={symbol} theme="dark" style="3" autosize hide_top_toolbar />
      </div>
    )
  }, [inputTokenSymbol, outputTokenSymbol])

  const renderHistory = (array: TransactionHistory[]) =>
    array
      .sort((firstTrade, secondTrade) => (Number(firstTrade.timestamp) > Number(secondTrade.timestamp) ? 1 : -1))
      .map(({ id, timestamp, amount0, amount1, amountUSD }) => (
        // TODO: improve styles
        <HistoryTrade key={id}>
          <div>{Number(amountUSD).toFixed(5)}</div> {/* TODO: calculate in - out */}
          <div style={{ textAlign: 'center' }}>
            <div>{amount0}</div>
            <div>{amount1}</div>
          </div>
          <div>{formatDate(Number(timestamp) * 1000)}</div>
        </HistoryTrade>
      ))

  return (
    <Box>
      <DiagramBox>{memoizedAdvancedRealTimeChart}</DiagramBox>
      <InfoBox>
        <HistoryBox>
          <HistoryTradeBox>
            <TitleColumn>Trade History</TitleColumn>
            {/* TODO: calculate height */}
            <div style={{ overflowX: 'hidden', overflowY: 'scroll', maxHeight: '300px' }}>{renderHistory(swaps)}</div>
          </HistoryTradeBox>
          <HistoryLiquidityBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <div style={{ overflowX: 'hidden' }}>{renderHistory(burnsAndMints)}</div>
          </HistoryLiquidityBox>
        </HistoryBox>
        <TradesAndOrderBox>
          <TradeBox>
            <TitleColumn>Trade</TitleColumn>
            {children}
          </TradeBox>
          <OrderBox>
            <TitleColumn>Orders</TitleColumn>
          </OrderBox>
        </TradesAndOrderBox>
      </InfoBox>
    </Box>
  )
}
