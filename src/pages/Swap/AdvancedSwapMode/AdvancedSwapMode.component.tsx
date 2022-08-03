import React, { FC, PropsWithChildren } from 'react'
import { useAllTrades } from 'services/Trades/hooks/useAllTrades'
import { Trade } from 'services/Trades/store/trades.selectors'

import Loader from '../../../components/Loader'
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
  LoaderContainer,
  TitleColumn,
  TradeContent,
  TradesAndOrderColumnBox,
} from './AdvancedSwapMode.styles'
import { ListElement } from './ListElement'
import { ListTitle } from './ListTitle'

const Loading = () => (
  <LoaderContainer>
    <Loader size="40px" stroke="#8780BF" />
  </LoaderContainer>
)

const renderTransaction = (array: Trade[], showTrades: boolean, isLoading: boolean, isNewPair: boolean) => {
  if (!showTrades) return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

  if (isNewPair) return null

  if (!array.length && !isLoading)
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

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { symbol, showTrades } = useTradesAdapter()
  const { allLiquidityHistory, allTradeHistory, isLoading, isNewPair } = useAllTrades()

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
            <ListBox>
              {renderTransaction(allTradeHistory, showTrades, isLoading, isNewPair)}
              {isLoading && <Loading />}
            </ListBox>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <ListTitle />
            <ListBox>
              {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair)}
              {isLoading && <Loading />}
            </ListBox>
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
