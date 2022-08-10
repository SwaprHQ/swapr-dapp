import { ChainId } from '@swapr/sdk'

import { useNavigate } from 'react-router-dom'
import { Text } from 'rebass'

import { Loader } from '../../../components/Loader'
import { TradeHistory } from '../../../services/Trades/trades.types'
import { useAllTrades } from '../../../services/Trades/useAllTrades.hook'
import { useTradesAdapter } from '../../../services/Trades/useTradesAdapter.hook'
import {
  Container,
  EmptyCellBody,
  LoaderContainer,
  Table,
  TableHeader,
  TablePoolHeader,
  TitleColumn,
  TradeContent,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { Title } from './Title'
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
  const navigate = useNavigate()

  const handleAddLiquidity = () => {
    navigate({ pathname: '/pools/create' })
  }

  return (
    <Container>
      <div className="d-1">
        <Chart symbol={symbol} />
      </div>
      <div className="d-2">
        <Title title="Trades" tabs={[{ title: currencyInSymbol || '' }, { title: currencyOutSymbol || '' }]} />
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
        <Table>
          <EmptyCellBody>The feature has not been implemented yet.</EmptyCellBody>
        </Table>
      </div>
      <div className="d-5">
        <Title title="Pool Activity" isSoloTab tabs={[{ title: 'Add liquidity', callback: handleAddLiquidity }]} />
        <TablePoolHeader>
          <Text>Amount ({currencyOutSymbol})</Text>
          <Text sx={{ textAlign: 'left' }}>Amount ({currencyInSymbol})</Text>
          <Text sx={{ textAlign: 'right' }}>Time</Text>
        </TablePoolHeader>
        <Table>
          {renderTransaction(allLiquidityHistory, showTrades, isLoading, isNewPair, chainId)}
          {isLoading && <Loading />}
        </Table>
      </div>
    </Container>
  )
}
