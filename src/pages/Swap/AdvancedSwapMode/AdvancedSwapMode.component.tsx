import { FC, PropsWithChildren, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { Flex, Text } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { AdvancedViewTradeHistory } from '../../../services/AdvancedTradingView/advancedTradingView.types'
import { useAdvancedTradingViewAdapter } from '../../../services/AdvancedTradingView/useAdvancedTradingViewAdapter.hook'
import { useAllTrades } from '../../../services/AdvancedTradingView/useAllTrades.hook'
import {
  AdvancedModeDetails,
  AdvancedModeHeader,
  AdvancedModeTitle,
  ChartWrapper,
  Container,
  EmptyCellBody,
  LiquidityWrapper,
  LoaderContainer,
  OrdersWrapper,
  SwapBox,
  SwapBoxWrapper,
  SwitchButton,
  SwitcherWrapper,
  TradesWrapper,
  TransactionsWrapper,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { Trade } from './Trade'

const renderStatusOfTrades = (arr: AdvancedViewTradeHistory[], showTrades: boolean, isLoading: boolean) => {
  if (!showTrades) return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

  if (!arr.length && !isLoading) {
    return <EmptyCellBody>There are no data for this token pair. Please try again later.</EmptyCellBody>
  }
}

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const {
    tradeHistory,
    hasMore: { hasMoreTrades },
  } = useAllTrades()
  const { chainId, inputToken, outputToken, symbol, showTrades, isLoading, fetchTrades } =
    useAdvancedTradingViewAdapter()

  const navigate = useNavigate()
  const [activeSwitchOption, setActiveSwitchOption] = useState('')

  const handleAddLiquidity = () => {
    if (inputToken && outputToken) {
      navigate({ pathname: `/pools/add/${inputToken.address}/${outputToken.address}` })
    }
  }

  useEffect(() => {
    if (inputToken && outputToken) {
      setActiveSwitchOption(inputToken.address)
    }
  }, [inputToken, outputToken])

  const handleSwitch = (option: string) => {
    setActiveSwitchOption(option)
  }

  return (
    <Container>
      <ChartWrapper>
        <Chart symbol={symbol} />
      </ChartWrapper>
      <TradesWrapper>
        <AdvancedModeHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <AdvancedModeTitle>Trades</AdvancedModeTitle>
            {inputToken && outputToken && (
              <SwitcherWrapper>
                <SwitchButton
                  onClick={() => handleSwitch(inputToken.address)}
                  active={activeSwitchOption === inputToken.address}
                >
                  {inputToken.symbol}
                </SwitchButton>
                <SwitchButton
                  onClick={() => handleSwitch(outputToken.address)}
                  active={activeSwitchOption === outputToken.address}
                >
                  {outputToken.symbol}
                </SwitchButton>
              </SwitcherWrapper>
            )}
          </Flex>
          <AdvancedModeDetails>
            <Text>Amount {showTrades ? `(${inputToken?.symbol})` : null}</Text>
            <Text>Amount {showTrades ? `(${outputToken?.symbol})` : null}</Text>
            <Text>Price {showTrades ? `(${outputToken?.symbol})` : null}</Text>
            <Text sx={{ textAlign: 'right' }}>Time</Text>
          </AdvancedModeDetails>
        </AdvancedModeHeader>
        <TransactionsWrapper id="transactions-wrapper-scrollable">
          <InfiniteScroll
            dataLength={tradeHistory.length}
            next={fetchTrades}
            hasMore={hasMoreTrades}
            scrollableTarget="transactions-wrapper-scrollable"
            loader={
              showTrades && (
                <LoaderContainer>
                  <Loader size="40px" stroke="#8780BF" />
                </LoaderContainer>
              )
            }
            scrollThreshold={1}
          >
            {!isLoading &&
              tradeHistory
                .sort((firstTrade, secondTrade) =>
                  Number(firstTrade.timestamp) < Number(secondTrade.timestamp) ? 1 : -1
                )
                .map(({ transactionId, timestamp, amountIn, amountOut, isSell, amountUSD, logoKey, price }) => {
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
                      price={price}
                    />
                  )
                })}
          </InfiniteScroll>
          {renderStatusOfTrades(tradeHistory, showTrades, isLoading)}
        </TransactionsWrapper>
      </TradesWrapper>
      <SwapBoxWrapper>
        <SwapBox>{children}</SwapBox>
      </SwapBoxWrapper>
      <OrdersWrapper>
        <AdvancedModeHeader>
          <Flex>
            <AdvancedModeTitle>Open orders</AdvancedModeTitle>
            <AdvancedModeTitle style={{ marginLeft: '20px', fontWeight: '400' }}>Order history</AdvancedModeTitle>
          </Flex>
          <AdvancedModeDetails>
            <Text>Price</Text>
            <Text>Amount</Text>
            <Text>Amount</Text>
            <Text sx={{ textAlign: 'right' }}>Time</Text>
          </AdvancedModeDetails>
        </AdvancedModeHeader>
      </OrdersWrapper>
      <LiquidityWrapper>
        <AdvancedModeHeader>
          <Flex justifyContent="space-between">
            <AdvancedModeTitle>Pool Activity</AdvancedModeTitle>
            <ButtonDark
              onClick={handleAddLiquidity}
              disabled={!(inputToken && outputToken)}
              style={{ fontSize: '10px', width: 'fit-content', padding: '4px 8px', marginTop: '-15px' }}
            >
              Add Liquidity
            </ButtonDark>
          </Flex>
          <AdvancedModeDetails>
            <Text>Amount</Text>
            <Text>Amount </Text>
            <Text sx={{ textAlign: 'right' }}>Time</Text>
          </AdvancedModeDetails>
        </AdvancedModeHeader>
      </LiquidityWrapper>
    </Container>
  )
}
