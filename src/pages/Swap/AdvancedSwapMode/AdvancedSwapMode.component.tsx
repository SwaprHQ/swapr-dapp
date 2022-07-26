import React, { FC, PropsWithChildren, useMemo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

import {
  ChartContainer,
  ContainerBox,
  DiagramContainerBox,
  HistoryBox,
  HistoryBoxBody,
  HistoryColumnBox,
  HistoryTrade,
  InfoContainerBox,
  TitleColumn,
  TradeContent,
  TradesAndOrderColumnBox,
  WidthBox,
} from './AdvancedSwapMode.styles'
import { TransactionHistory } from './AdvancedSwapMode.types'
import { formatDate } from './AdvancedSwapMode.utils'
import { usePair } from './usePair'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { burnsAndMints, swaps, inputTokenSymbol, outputTokenSymbol } = usePair()

  const memoizedAdvancedRealTimeChart = useMemo(() => {
    const symbol = inputTokenSymbol && outputTokenSymbol ? `${inputTokenSymbol}${outputTokenSymbol}` : 'USDCUSD'
    return (
      <ChartContainer>
        <AdvancedRealTimeChart symbol={symbol} theme="dark" style="3" autosize hide_top_toolbar />
      </ChartContainer>
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
    <ContainerBox>
      <DiagramContainerBox>
        <TitleColumn>Diagram</TitleColumn>
        {memoizedAdvancedRealTimeChart}
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <HistoryBoxBody>{renderHistory(swaps)}</HistoryBoxBody>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <HistoryBoxBody>{renderHistory(burnsAndMints)}</HistoryBoxBody>
          </HistoryBox>
        </HistoryColumnBox>
        <TradesAndOrderColumnBox>
          <WidthBox>
            <TitleColumn>Trade</TitleColumn>
            <TradeContent>{children}</TradeContent>
          </WidthBox>
          <WidthBox>
            <TitleColumn>Orders</TitleColumn>
          </WidthBox>
        </TradesAndOrderColumnBox>
      </InfoContainerBox>
    </ContainerBox>
  )
}
