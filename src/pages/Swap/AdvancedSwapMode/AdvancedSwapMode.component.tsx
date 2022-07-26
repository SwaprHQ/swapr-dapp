import React, { FC, PropsWithChildren } from 'react'

import { ListBox } from '../ListBox'
import { AdvancedChart } from './AdvancedChart'
import {
  ChartContainer,
  ContainerBox,
  DiagramContainerBox,
  HistoryBox,
  HistoryBoxBody,
  HistoryColumnBox,
  InfoContainerBox,
  ListTitleElement,
  ListTitleRow,
  TitleColumn,
  TradeContent,
  TradesAndOrderColumnBox,
  WidthBox,
} from './AdvancedSwapMode.styles'
import { TransactionHistory } from './AdvancedSwapMode.types'
import { usePair } from './usePair'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { burnsAndMints, swaps, inputTokenSymbol, outputTokenSymbol } = usePair()

  const renderHistory = (array: TransactionHistory[]) =>
    array
      .sort((firstTrade, secondTrade) => (Number(firstTrade.timestamp) < Number(secondTrade.timestamp) ? 1 : -1))
      .map(({ id, timestamp, amount0, amount1, amountUSD }) => (
        // TODO: improve styles
        <ListBox key={id} amount0={amount0} amount1={amount1} amountUSD={amountUSD} timestamp={timestamp} />
      ))

  return (
    <ContainerBox>
      <DiagramContainerBox>
        <TitleColumn>Diagram</TitleColumn>
        <ChartContainer>
          <AdvancedChart inputTokenSymbol={inputTokenSymbol} outputTokenSymbol={outputTokenSymbol} />
        </ChartContainer>
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <ListTitleRow>
              <ListTitleElement>USD</ListTitleElement>
              <ListTitleElement>Amount</ListTitleElement>
              <ListTitleElement>Time</ListTitleElement>
            </ListTitleRow>
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
