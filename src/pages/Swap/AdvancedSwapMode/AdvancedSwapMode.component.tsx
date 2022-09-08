import { Token } from '@swapr/sdk'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { Flex, Text } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { Loader } from '../../../components/Loader'
import { sortsBeforeTokens } from '../../../services/AdvancedTradingView/advancedTradingView.selectors'
import { AdvancedViewTransaction } from '../../../services/AdvancedTradingView/advancedTradingView.types'
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

const renderStatusOfTrades = (arr: AdvancedViewTransaction[], showTrades: boolean, isLoading: boolean) => {
  if (!showTrades) return <EmptyCellBody>Please select the token which you want to get data</EmptyCellBody>

  if (!arr.length && !isLoading) {
    return <EmptyCellBody>There are no data for this token pair. Please try again later.</EmptyCellBody>
  }
}

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const {
    tradeHistory,
    liquidityHistory,
    hasMore: { hasMoreTrades, hasMoreActivity },
  } = useAllTrades()
  const [tokens, setTokens] = useState<Token[]>([])
  const [token0, token1] = tokens
  const { chainId, inputToken, outputToken, symbol, showTrades, isLoading, fetchTrades, fetchActivity } =
    useAdvancedTradingViewAdapter()

  useEffect(() => {
    if (inputToken && outputToken) {
      setTokens(sortsBeforeTokens(inputToken, outputToken))
    }
  }, [inputToken, outputToken])

  const navigate = useNavigate()
  const [activeSwitchOption, setActiveSwitchOption] = useState<Token>()

  const handleAddLiquidity = () => {
    if (inputToken && outputToken) {
      navigate({ pathname: `/pools/add/${inputToken.address}/${outputToken.address}` })
    }
  }

  useEffect(() => {
    if (outputToken && token0 && token1) {
      setActiveSwitchOption(outputToken.address === token0.address ? token0 : token1)
    }
    // eslint-disable-next-line
  }, [token0, token1])

  const handleSwitch = (option: Token) => {
    if (activeSwitchOption?.address !== option.address) {
      setActiveSwitchOption(option)
    }
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
            {token0 && token1 && activeSwitchOption && (
              <SwitcherWrapper>
                <SwitchButton
                  onClick={() => handleSwitch(token0)}
                  active={activeSwitchOption.address === token0.address}
                >
                  {token0.symbol}
                </SwitchButton>
                <SwitchButton
                  onClick={() => handleSwitch(token1)}
                  active={activeSwitchOption.address === token1.address}
                >
                  {token1.symbol}
                </SwitchButton>
              </SwitcherWrapper>
            )}
          </Flex>
          {showTrades && activeSwitchOption && (
            <AdvancedModeDetails>
              <Text>Amount {`(${inputToken?.symbol})`}</Text>
              <Text>Amount {`(${outputToken?.symbol})`}</Text>
              <Text>Price {`(${activeSwitchOption?.symbol})`}</Text>
              <Text sx={{ textAlign: 'right' }}>Time</Text>
            </AdvancedModeDetails>
          )}
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
            {showTrades &&
              activeSwitchOption &&
              tradeHistory
                .sort((firstTrade, secondTrade) => Number(secondTrade.timestamp) - Number(firstTrade.timestamp))
                .map((tx, index) => {
                  return (
                    <Trade
                      key={`${tx.transactionId}-${index}`}
                      isSell={tx.isSell}
                      transactionId={tx.transactionId}
                      logoKey={tx.logoKey}
                      chainId={chainId}
                      amountIn={tx.amountIn}
                      amountOut={tx.amountOut}
                      timestamp={tx.timestamp}
                      amountUSD={tx.amountUSD}
                      price={activeSwitchOption?.address === token0.address ? tx.priceToken0 : tx.priceToken1}
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
              disabled={!showTrades}
              style={{ fontSize: '10px', width: 'fit-content', padding: '4px 8px', marginTop: '-15px' }}
            >
              Add Liquidity
            </ButtonDark>
          </Flex>
          <AdvancedModeDetails>
            <Text>Amount {token0?.symbol ? `(${token0.symbol})` : ''}</Text>
            <Text>Amount {token1?.symbol ? `(${token1.symbol})` : ''}</Text>
            <Text sx={{ textAlign: 'right' }}>Time</Text>
          </AdvancedModeDetails>
          <TransactionsWrapper maxHeight="400px" id="liquidity-wrapper-scrollable">
            <InfiniteScroll
              dataLength={liquidityHistory.length}
              next={fetchActivity}
              hasMore={hasMoreActivity}
              scrollableTarget="liquidity-wrapper-scrollable"
              loader={
                showTrades && (
                  <LoaderContainer>
                    <Loader size="40px" stroke="#8780BF" />
                  </LoaderContainer>
                )
              }
              scrollThreshold={1}
            >
              {showTrades &&
                liquidityHistory
                  .sort((firstTrade, secondTrade) => Number(secondTrade.timestamp) - Number(firstTrade.timestamp))
                  .map((tx, index) => {
                    return (
                      <Trade
                        key={`${tx.transactionId}-${index}`}
                        isSell={Boolean(tx.isSell)}
                        transactionId={tx.transactionId}
                        logoKey={tx.logoKey}
                        chainId={chainId}
                        amountIn={tx.amountIn}
                        amountOut={tx.amountOut}
                        timestamp={tx.timestamp}
                        amountUSD={tx.amountUSD}
                      />
                    )
                  })}
            </InfiniteScroll>
          </TransactionsWrapper>
        </AdvancedModeHeader>
      </LiquidityWrapper>
    </Container>
  )
}
