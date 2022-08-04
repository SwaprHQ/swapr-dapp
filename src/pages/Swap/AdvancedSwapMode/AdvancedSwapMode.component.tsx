import { ChainId } from '@swapr/sdk'

import { FC, PropsWithChildren } from 'react'

import { Loader } from '../../../components/Loader'
import { TradeHistory } from '../../../services/Trades/trades.types'
import { useAllTrades } from '../../../services/Trades/useAllTrades.hook'
import { useTradesAdapter } from '../../../services/Trades/useTradesAdapter.hook'
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
import { Chart } from './Chart'
import { Trade } from './Trade'

const Loading = () => (
  <LoaderContainer>
    <Loader size="40px" stroke="#8780BF" />
  </LoaderContainer>
)

const renderTransaction = (
  array: TradeHistory[],
  showTrades: boolean,
  isLoading: boolean,
  isNewPair: boolean,
  chainId?: ChainId
) => {
  if (!showTrades) return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

  if (isNewPair) return null

  if (!array.length && !isLoading)
    return <EmptyCellBody>There are no data for this token pair. Please try again later.</EmptyCellBody>

  return array
    .sort((firstTrade, secondTrade) => (Number(firstTrade.timestamp) < Number(secondTrade.timestamp) ? 1 : -1))
    .map(({ transactionId, timestamp, amountIn, amountOut, isSell, amountUSD, logoKey }) => {
      return (
        <Trade
          key={transactionId}
          isSell={isSell}
          transactionId={transactionId}
          logoKey={logoKey}
          chainId={chainId}
          amountIn={amountIn}
          amountOut={amountOut}
          timestamp={timestamp}
          amountUSD={amountUSD}
        />
      )
    })
}

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const { chainId, symbol, showTrades } = useTradesAdapter()
  const { allLiquidityHistory, allTradeHistory, isLoading, isNewPair } = useAllTrades()

  return (
    <ContainerBox>
      <DiagramContainerBox>
        <Chart symbol={symbol} />
      </DiagramContainerBox>
      <InfoContainerBox>
        <HistoryColumnBox>
          <HistoryBox>
            <TitleColumn>Trade History</TitleColumn>
            <ListBox>
              {renderTransaction(allTradeHistory, showTrades, isLoading, isNewPair, chainId)}
              {isLoading && <Loading />}
            </ListBox>
          </HistoryBox>
          <HistoryBox>
            <TitleColumn>Liquidity History</TitleColumn>
            <ListBox>
              {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair, chainId)}
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
