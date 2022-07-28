import React, { FC, PropsWithChildren } from 'react'
import { useAllTrades } from 'services/Trades/hooks/useAllTrades'
import { Trade } from 'services/Trades/store/trades.selectors'

import { useTradesAdapter } from '../../../services/Trades/hooks/useTradesAdapter'
import { AdvancedChart } from './AdvancedChart'
import {
  ColumnCellBox,
  ContainerBox,
  DiagramContainerBox,
  EmptyCellBody,
  HistoryBox,
  HistoryColumnBox,
  InfoContainerBox,
  ListBox,
  TitleColumn,
  TradeContent,
  TradesAndOrderColumnBox,
} from './AdvancedSwapMode.styles'
import { ListElement } from './ListElement'
import { ListTitle } from './ListTitle'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { symbol, showTrades } = useTradesAdapter()
  const { allLiquidityHistory, allTradeHistory } = useAllTrades()

  //TODO: loading state
  const renderTransaction = (array: Trade[]) => {
    if (!showTrades) return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

    if (!array.length)
      return <EmptyCellBody>There are no data for this token pair. Please try again later.</EmptyCellBody>

    return array
      .sort((firstTrade, secondTrade) => (Number(firstTrade.timestamp) < Number(secondTrade.timestamp) ? 1 : -1))
      .map(({ transactionId, timestamp, amount0, amount1, amountUSD }) => (
        <ListElement
          key={transactionId}
          amount0={amount0}
          amount1={amount1}
          amountUSD={amountUSD}
          timestamp={timestamp}
        />
      ))
  }

  return (
    <ContainerBox>
      <DiagramContainerBox>
        <AdvancedChart symbol={symbol} />
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <ListTitle />
            <ListBox>{renderTransaction(allTradeHistory)}</ListBox>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <ListTitle />
            <ListBox>{renderTransaction(allLiquidityHistory)}</ListBox>
          </HistoryBox>
        </HistoryColumnBox>
        <TradesAndOrderColumnBox>
          <ColumnCellBox>
            <TitleColumn>Trade</TitleColumn>
            <TradeContent>{children}</TradeContent>
          </ColumnCellBox>
          <ColumnCellBox>
            <TitleColumn>Orders</TitleColumn>
            <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
          </ColumnCellBox>
        </TradesAndOrderColumnBox>
      </InfoContainerBox>
    </ContainerBox>
  )
}
