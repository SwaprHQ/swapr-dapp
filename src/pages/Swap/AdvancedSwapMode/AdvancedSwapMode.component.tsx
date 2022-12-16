import { PropsWithChildren, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { useAdvancedTradingView } from '../../../services/AdvancedTradingView/useAdvancedTradingView.hook'
import { useAllTrades } from '../../../services/AdvancedTradingView/useAllTrades.hook'
import {
  AdvancedModeHeader,
  AdvancedModeTitle,
  AdvancedSwapModeWrapper,
  BaseWrapper,
  ChartWrapper,
  LiquidityWrapper,
  OrderButton,
  OrderHistoryHeader,
  OrdersWrapper,
  PairDetailsWrapper,
  SwapBox,
  SwitchButton,
  SwitcherWrapper,
  TradesWrapper,
  TransactionsWrapper,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { ColumnHeader } from './ColumnHeader'
import { InfiniteScroll } from './InfiniteScroll'
import { OrderHistoryTransaction } from './OrderHistory/OrderHistoryTransaction'
import { PairDetails } from './PairDetails'

enum TradesWrapperHeight {
  MIN = 570,
  PADDING = 85,
}

export const AdvancedSwapMode = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation('swap')

  const tradesWrapper = useRef<HTMLDivElement>(null)

  const {
    transactions,
    tradeHistory,
    liquidityHistory,
    hasMore: { hasMoreTrades, hasMoreActivity },
  } = useAllTrades()

  const {
    chainId,
    inputToken,
    outputToken,
    showTrades,
    isLoadingTrades,
    isLoadingActivity,
    fetchTrades,
    fetchActivity,
    pairTokens: [token0, token1],
    activeCurrencyOption,
    handleAddLiquidity,
    handleSwitchCurrency,
    isFetched,
    pairAddress,
  } = useAdvancedTradingView()

  const transactionsWrapperMaxHeight = tradesWrapper?.current?.clientHeight
    ? tradesWrapper?.current?.clientHeight - TradesWrapperHeight.PADDING
    : TradesWrapperHeight.MIN

  return (
    <AdvancedSwapModeWrapper>
      <PairDetailsWrapper>
        <PairDetails token0={token0} token1={token1} activeCurrencyOption={inputToken} />
      </PairDetailsWrapper>
      <ChartWrapper>
        <Chart pairAddress={pairAddress} />
      </ChartWrapper>
      <TradesWrapper ref={tradesWrapper}>
        <AdvancedModeHeader>
          <SwitcherWrapper>
            <SwitchButton
              onClick={() => handleSwitchCurrency(token0)}
              active={activeCurrencyOption?.address === token0?.address}
            >
              {token0?.symbol?.substring(0, 6)}
            </SwitchButton>
            <SwitchButton
              onClick={() => handleSwitchCurrency(token1)}
              active={activeCurrencyOption?.address === token1?.address}
            >
              {token1?.symbol?.substring(0, 6)}
            </SwitchButton>
          </SwitcherWrapper>
          <AdvancedModeTitle>{t('advancedTradingView.column.trades')}</AdvancedModeTitle>
          <ColumnHeader
            showTrades={showTrades}
            inputTokenSymbol={inputToken?.symbol ?? ''}
            outputTokenSymbol={outputToken?.symbol ?? ''}
            activeCurrencySymbolOption={activeCurrencyOption?.symbol ?? ''}
            showPrice
          />
        </AdvancedModeHeader>
        <TransactionsWrapper maxHeight={`${transactionsWrapperMaxHeight}px`} id="transactions-wrapper-scrollable">
          <InfiniteScroll
            token0={token0}
            chainId={chainId}
            data={tradeHistory}
            showTrades={showTrades}
            fetchMore={fetchTrades}
            hasMore={hasMoreTrades}
            isLoading={isLoadingTrades}
            activeCurrencyOption={activeCurrencyOption}
            isFetched={isFetched}
            scrollableTarget="transactions-wrapper-scrollable"
          />
        </TransactionsWrapper>
      </TradesWrapper>
      <BaseWrapper>
        <SwapBox>{children}</SwapBox>
      </BaseWrapper>
      <OrdersWrapper>
        <AdvancedModeHeader>
          <Flex>
            <OrderButton isActive>{t('advancedTradingView.column.orderHistory')}</OrderButton>
            <OrderButton disabled>{t('advancedTradingView.column.openOrders')}</OrderButton>
          </Flex>
          <TransactionsWrapper style={{ padding: '5px' }} maxHeight="300px">
            <OrderHistoryHeader>
              <Text>{t('advancedTradingView.orderHistory.from')}</Text>
              <Text>{t('advancedTradingView.orderHistory.to')}</Text>
              <Text>{t('advancedTradingView.orderHistory.protocol')}</Text>
              <Text>{t('advancedTradingView.orderHistory.type')}</Text>
              <Text>{t('advancedTradingView.orderHistory.date')}</Text>
              <Text>{t('advancedTradingView.orderHistory.status')}</Text>
              <Text>{t('advancedTradingView.orderHistory.tx')}</Text>
            </OrderHistoryHeader>
            {transactions.map((tx, index) => (
              <OrderHistoryTransaction key={index} tx={tx} />
            ))}
          </TransactionsWrapper>
        </AdvancedModeHeader>
      </OrdersWrapper>
      <LiquidityWrapper>
        <AdvancedModeHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <AdvancedModeTitle>{t('advancedTradingView.column.poolActivity')}</AdvancedModeTitle>
            <ButtonDark
              onClick={handleAddLiquidity}
              disabled={!showTrades}
              style={{ fontSize: '10px', width: 'fit-content', padding: '4px 8px', margin: '0' }}
            >
              {t('advancedTradingView.addLiquidity')}
            </ButtonDark>
          </Flex>
          <ColumnHeader
            activeCurrencySymbolOption={activeCurrencyOption?.symbol ?? ''}
            showPrice={false}
            inputTokenSymbol={token0?.symbol ?? ''}
            outputTokenSymbol={token1?.symbol ?? ''}
            showTrades={showTrades}
          />
        </AdvancedModeHeader>
        <TransactionsWrapper maxHeight="280px" id="liquidity-wrapper-scrollable">
          <InfiniteScroll
            token0={token0}
            chainId={chainId}
            data={liquidityHistory}
            showTrades={showTrades}
            fetchMore={fetchActivity}
            hasMore={hasMoreActivity}
            isLoading={isLoadingActivity}
            isFetched={isFetched}
            activeCurrencyOption={activeCurrencyOption}
            scrollableTarget="liquidity-wrapper-scrollable"
          />
        </TransactionsWrapper>
      </LiquidityWrapper>
    </AdvancedSwapModeWrapper>
  )
}
