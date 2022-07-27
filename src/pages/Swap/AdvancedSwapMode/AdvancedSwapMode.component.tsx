import React, { FC, PropsWithChildren } from 'react'

import Loader from '../../../components/Loader'
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
import { TransactionHistory } from './AdvancedSwapMode.types'
import { ListElement } from './ListElement'
import { ListTitle } from './ListTitle'
import { usePair } from './usePair'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { burnsAndMints, swaps, inputTokenSymbol, outputTokenSymbol, isLoading } = usePair()

  const renderHistory = (array: TransactionHistory[]) => {
    if (!inputTokenSymbol || !outputTokenSymbol)
      return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

    if (!array.length && !isLoading)
      return <EmptyCellBody>There are no data for this token pair. Please try again later.</EmptyCellBody>

    if (isLoading)
      return (
        <LoaderContainer>
          <Loader size="40px" stroke="#8780BF" />
        </LoaderContainer>
      )

    return array
      .sort((firstTrade, secondTrade) => (Number(firstTrade.timestamp) < Number(secondTrade.timestamp) ? 1 : -1))
      .map(({ id, timestamp, amount0, amount1, amountUSD }) => (
        <ListElement key={id} amount0={amount0} amount1={amount1} amountUSD={amountUSD} timestamp={timestamp} />
      ))
  }

  return (
    <ContainerBox>
      <DiagramContainerBox>
        <AdvancedChart inputTokenSymbol={inputTokenSymbol} outputTokenSymbol={outputTokenSymbol} />
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <ListTitle />
            <ListBox>{renderHistory(swaps)}</ListBox>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <ListTitle />
            <ListBox>{renderHistory(burnsAndMints)}</ListBox>
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
