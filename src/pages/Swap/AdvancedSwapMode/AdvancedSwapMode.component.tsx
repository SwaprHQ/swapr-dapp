import { ChainId } from '@swapr/sdk'

import { FC, PropsWithChildren } from 'react'
import { Flex, Text } from 'rebass'
import styled from 'styled-components'

import { Loader } from '../../../components/Loader'
import { TradeHistory } from '../../../services/Trades/trades.types'
import { useAllTrades } from '../../../services/Trades/useAllTrades.hook'
import { useTradesAdapter } from '../../../services/Trades/useTradesAdapter.hook'
import { breakpoints } from '../../../utils/theme'
import {
  AdvanceSwapModeHeight,
  BorderStyling,
  ColumnCellBox,
  ContainerBox,
  CustomScrollBar,
  DiagramContainerBox,
  EmptyCellBody,
  HistoryBox,
  HistoryColumnBox,
  InfoContainerBox,
  LoaderContainer,
  Table,
  TableHeader,
  TablePoolHeader,
  TitleColumn,
  TradeContent,
  TradesAndOrderColumnBox,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { Trade } from './Trade'

const Container = styled.div`
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  width: 100%;
  // height: 100vh;
  ${AdvanceSwapModeHeight}
  display: grid;
  // grid-template-rows: minmax(400px, 2fr) minmax(300px, 1fr);
  // grid-auto-columns: 50% 50%;

  // grid-template-rows: minmax(400px, auto) 20px minmax(400px, auto) minmax(400px, auto);
  // grid-template-columns: minmax(250px, 1fr) minmax(250px, 1fr) 350px minmax(450px, 1.5fr);
  // grid-template-columns: minmax(450px, 1fr) minmax(300px, auto) auto minmax(450px, auto);

  grid-template-columns: 50% 20% 30%;
  grid-template-rows: 60% 40%;

  // div {
  //   text-align: center;
  //   font-size: 30px;
  //   color: #fff;
  // }

  .d-1 {
    // grid-row: 1/ 2;
    // grid-column: 1 /3;
    ${BorderStyling}
  }
  // .d-2 {
  //   grid-row: 1 /2;
  //   grid-column: 3 /4;
  // }

  // .d-3 {
  //   grid-row: 1 /2;
  //   grid-column: 4 /5;
  // }
  .d-4 {
    // grid-row: 2 /3;
    grid-column: 1 /2;
  }
  .d-5 {
    // grid-row: 2 /3;
    grid-column: 2 /4;
  }

  .d-2 {
    border-top: 1px solid rgba(41, 38, 67, 1);
    border-left: 0;
  }
  .d-3 {
    // overflow-y: auto;
    // ${CustomScrollBar};
    // height: 450px;
    border-top: 1px solid rgba(41, 38, 67, 1);
    border-bottom: 1px solid rgba(41, 38, 67, 1);
    border-left: 1px solid rgba(41, 38, 67, 1);
  }

  .d-4,
  .d-5 {
    border: 1px solid rgba(41, 38, 67, 1);
  }

  @media screen and (max-width: ${breakpoints.l}) {
    height: auto;
    grid-template-rows: auto;
    .d-1 {
      grid-column: 1 /-1;
      height: 400px;
    }
    .d-2,
    .d-3 {
      max-height: 450px;
    }
    d-1,
    .d-4,
    .d-5 {
      height: 400px;
    }
    .d-1 {
      order: 0;
    }

    .d-2 {
      order: 2;
      grid-column: 3 /4;
    }

    .d-3 {
      order: 1;
      grid-column: 1 /3;
    }
    .d-4 {
      order: 4;
    }
    .d-5 {
      order: 5;
    }
    .d-2 {
      border-left: 1px solid rgba(41, 38, 67, 1);
    }
  }
  @media screen and (min-width: ${breakpoints.s}) && (max-width: ${breakpoints.l}) {
    // grid-template-columns: 1fr 1fr;

    .d-2 {
      grid-row: 2 /3;
    }

    .d-3 {
      grid-row: 2 /3;
    }
  }
  @media screen and (max-width: ${breakpoints.md}) {
    height: auto;
    grid-template-columns: 50% 10% 40%;
  }
  @media screen and (max-width: ${breakpoints.s}) {
    height: auto;
    grid-template-columns: 100%;

    .d-1,
    .d-2,
    .d-3,
    .d-4,
    .d-5 {
      grid-column: auto;
    }

    .d-1,
    .d-2,
    .d-3,
    .d-4,
    .d-5 {
      border-left: 0;
      border-right: 0;
    }
  }
`

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

export const AdvancedSwapMode = ({
  children,
  currencyInSymbol,
  currencyOutSymbol,
}: {
  children: React.ReactNode
  currencyInSymbol?: string
  currencyOutSymbol?: string
}) => {
  const { chainId, symbol, showTrades } = useTradesAdapter()
  const { allLiquidityHistory, allTradeHistory, isLoading, isNewPair } = useAllTrades()
  console.log(allTradeHistory, symbol, showTrades)

  /* <Container className="test">
      <div className="d-1">
        <AdvancedChart inputTokenSymbol={inputTokenSymbol} outputTokenSymbol={outputTokenSymbol} />
      </div>
      <div className="d-2">
        <TitleColumn>Trade History</TitleColumn>
        <ListTitle />
        <ListBox>{renderHistory(swaps)}</ListBox>
      </div>
      <div className="d-3">
        <TitleColumn>Trade</TitleColumn>
        <TradeContent>{children}</TradeContent>
      </div>
      <div className="d-4">
        <TitleColumn>Liquidity History</TitleColumn>
        <ListTitle />
        <ListBox>{renderHistory(burnsAndMints)}</ListBox>
      </div>
      <div className="d-5">
        <TitleColumn>Orders</TitleColumn>
        <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
      </div>
    </Container> */

  return (
    <Container>
      <div className="d-1">
        <Chart symbol={symbol} />
      </div>
      <div className="d-2">
        <TitleColumn>Trades</TitleColumn>
        <TableHeader>
          <Text>Price ({currencyInSymbol})</Text>
          <Text>Amount ({currencyOutSymbol})</Text>
          <Text sx={{ textAlign: 'right' }}>Time</Text>
        </TableHeader>
        <Table>
          {renderTransaction(allTradeHistory, showTrades, isLoading, isNewPair, chainId)}
          {isLoading && <Loading />}
        </Table>
      </div>
      <div className="d-3">
        <TradeContent>{children}</TradeContent>
      </div>
      <div className="d-4">
        <TitleColumn>Open Orders</TitleColumn>
        {/* <ListTitle /> */}
        <Table>
          <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
        </Table>
      </div>
      <div className="d-5">
        <TitleColumn>Pool Activity</TitleColumn>
        <TablePoolHeader>
          <Text>Amount ({currencyOutSymbol})</Text>
          <Text sx={{ textAlign: 'left' }}>Amount ({currencyInSymbol})</Text>
          <Text sx={{ textAlign: 'right' }}>Time</Text>
        </TablePoolHeader>
        {/* <ListTitle /> */}
        <Table>
          {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair, chainId)}
          {isLoading && <Loading />}
        </Table>
      </div>
    </Container>
  )

  // return (
  //   <ContainerBox>
  //     <DiagramContainerBox>
  //       <Chart symbol={symbol} />
  //     </DiagramContainerBox>
  //     <InfoContainerBox>
  //       <HistoryColumnBox>
  //         <HistoryBox>
  //           <TitleColumn>Trade History</TitleColumn>
  //           <ListBox>
  //             {renderTransaction(allTradeHistory, showTrades, isLoading, isNewPair, chainId)}
  //             {isLoading && <Loading />}
  //           </ListBox>
  //         </HistoryBox>
  //         <HistoryBox>
  //           <TitleColumn>Liquidity History</TitleColumn>
  //           <ListBox>
  //             {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair, chainId)}
  //             {isLoading && <Loading />}
  //           </ListBox>
  //         </HistoryBox>
  //       </HistoryColumnBox>
  //       <TradesAndOrderColumnBox>
  //         <ColumnCellBox>
  //           <TitleColumn>Trade</TitleColumn>
  //           <TradeContent>{children}</TradeContent>
  //         </ColumnCellBox>
  //         <ColumnCellBox>
  //           <TitleColumn>Orders</TitleColumn>
  //           <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
  //         </ColumnCellBox>
  //       </TradesAndOrderColumnBox>
  //     </InfoContainerBox>
  //   </ContainerBox>
  // )

  // return (
  //   <ContainerBox>
  //     <DiagramContainerBox>
  //       <AdvancedChart symbol={symbol} />
  //     </DiagramContainerBox>
  //     <InfoContainerBox>
  //       <HistoryColumnBox>
  //         <HistoryBox>
  //           <TitleColumn>Trade History</TitleColumn>
  //           <ListTitle />
  //           <ListBox>
  //             {renderTransaction(allTradeHistory, showTrades, isLoading, isNewPair)}
  //             {isLoading && <Loading />}
  //           </ListBox>
  //         </HistoryBox>
  //         <HistoryBox>
  //           <TitleColumn>Liquidity History</TitleColumn>
  //           <ListTitle />
  //           <ListBox>
  //             {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair)}
  //             {isLoading && <Loading />}
  //           </ListBox>
  //         </HistoryBox>
  //       </HistoryColumnBox>
  //       <TradesAndOrderColumnBox>
  //         <ColumnCellBox>
  //           <TitleColumn>Trade</TitleColumn>
  //           <TradeContent>{children}</TradeContent>
  //         </ColumnCellBox>
  //         <ColumnCellBox>
  //           <TitleColumn>Orders</TitleColumn>
  //           <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
  //         </ColumnCellBox>
  //       </TradesAndOrderColumnBox>
  //     </InfoContainerBox>
  //   </ContainerBox>
  // )
}
