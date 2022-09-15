import { FC, PropsWithChildren, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { useAdvancedTradingView } from '../../../services/AdvancedTradingView/useAdvancedTradingView.hook'
import { useAllTrades } from '../../../services/AdvancedTradingView/useAllTrades.hook'
import { TransactionRows } from '../../Account/TransactionRows'
import {
  AdvancedModeHeader,
  AdvancedModeTitle,
  AdvancedSwapModeContainer,
  BaseWrapper,
  ChartWrapper,
  LiquidityWrapper,
  OrderButton,
  OrdersWrapper,
  PairDetailsWrapper,
  SwapBox,
  TransactionsWrapper,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { ColumnHeader } from './ColumnHeader'
import { InfiniteScroll } from './InfiniteScroll'
import { PairDetails } from './PairDetails'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
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
    inputTokenSymbol,
    outputTokenSymbol,
    symbol,
    showTrades,
    isLoadingTrades,
    isLoadingActivity,
    fetchTrades,
    fetchActivity,
    pairTokens,
    activeCurrencyOption,
    handleAddLiquidity,
    handleSwitchCurrency,
    isFetched,
  } = useAdvancedTradingView()

  const [token0, token1] = pairTokens

  return (
    <AdvancedSwapModeContainer>
      <PairDetailsWrapper>
        <PairDetails
          token0={token0}
          token1={token1}
          activeCurrencyOption={activeCurrencyOption}
          handleSwitchCurrency={handleSwitchCurrency}
        />
      </PairDetailsWrapper>
      <ChartWrapper>
        <Chart symbol={symbol} />
      </ChartWrapper>
      <BaseWrapper ref={tradesWrapper}>
        <AdvancedModeHeader>
          <AdvancedModeTitle>{t('advancedTradingView.column.trades')}</AdvancedModeTitle>
          <ColumnHeader
            showTrades={showTrades}
            inputTokenSymbol={inputTokenSymbol}
            outputTokenSymbol={outputTokenSymbol}
            activeCurrencySymbolOption={activeCurrencyOption?.symbol ?? ''}
            showPrice
          />
        </AdvancedModeHeader>
        <TransactionsWrapper
          maxHeight={`${tradesWrapper?.current?.clientHeight ? tradesWrapper?.current?.clientHeight - 100 : 560}px`}
          id="transactions-wrapper-scrollable"
        >
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
      </BaseWrapper>
      <BaseWrapper>
        <SwapBox>{children}</SwapBox>
      </BaseWrapper>
      <OrdersWrapper>
        <AdvancedModeHeader>
          <Flex>
            <OrderButton isActive>{t('advancedTradingView.column.orderHistory')}</OrderButton>
            <OrderButton disabled>{t('advancedTradingView.column.openOrder')}</OrderButton>
          </Flex>
          <TransactionsWrapper style={{ marginTop: '20px' }} maxHeight="300px">
            <TransactionRows transactions={transactions} showBackgroundStatus={false} />
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
            inputTokenSymbol={inputTokenSymbol}
            outputTokenSymbol={outputTokenSymbol}
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
    </AdvancedSwapModeContainer>
  )
}
