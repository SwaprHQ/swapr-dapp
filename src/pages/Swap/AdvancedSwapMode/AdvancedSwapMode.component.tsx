import { FC, PropsWithChildren, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { useAdvancedTradingView } from '../../../services/AdvancedTradingView/useAdvancedTradingView.hook'
import { useAllTrades } from '../../../services/AdvancedTradingView/useAllTrades.hook'
import {
  AdvancedModeHeader,
  AdvancedModeTitle,
  AdvancedSwapModeContainer,
  BaseWrapper,
  ChartWrapper,
  LiquidityWrapper,
  OrderButton,
  OrdersWrapper,
  SwapBox,
  SwitchButton,
  SwitcherWrapper,
  TransactionsWrapper,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { ColumnHeader } from './ColumnHeader'
import { InfiniteScroll } from './InfiniteScroll'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const {
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
  } = useAdvancedTradingView()

  const [token0, token1] = pairTokens

  const { t } = useTranslation(['swap', 'liquidity'])
  const tradesWrapper = useRef<HTMLDivElement>(null)

  return (
    <AdvancedSwapModeContainer>
      <ChartWrapper>
        <Chart symbol={symbol} />
      </ChartWrapper>
      <BaseWrapper ref={tradesWrapper}>
        <AdvancedModeHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <AdvancedModeTitle>{t('column.trades')}</AdvancedModeTitle>
            {showTrades && !!pairTokens.length && activeCurrencyOption && (
              <SwitcherWrapper>
                <SwitchButton
                  onClick={() => handleSwitchCurrency(token0)}
                  active={activeCurrencyOption.address === token0.address}
                >
                  {token0.symbol}
                </SwitchButton>
                <SwitchButton
                  onClick={() => handleSwitchCurrency(token1)}
                  active={activeCurrencyOption.address === token1.address}
                >
                  {token1.symbol}
                </SwitchButton>
              </SwitcherWrapper>
            )}
          </Flex>
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
            <OrderButton isActive>{t('column.orderHistory')}</OrderButton>
            <OrderButton disabled>{t('column.openOrder')}</OrderButton>
          </Flex>
        </AdvancedModeHeader>
      </OrdersWrapper>
      <LiquidityWrapper>
        <AdvancedModeHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <AdvancedModeTitle>{t('column.poolActivity')}</AdvancedModeTitle>
            <ButtonDark
              onClick={handleAddLiquidity}
              disabled={!showTrades}
              style={{ fontSize: '10px', width: 'fit-content', padding: '4px 8px', margin: '0' }}
            >
              {t('addLiquidity')}
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
        <TransactionsWrapper maxHeight="170px" id="liquidity-wrapper-scrollable">
          <InfiniteScroll
            token0={token0}
            chainId={chainId}
            data={liquidityHistory}
            showTrades={showTrades}
            fetchMore={fetchActivity}
            hasMore={hasMoreActivity}
            isLoading={isLoadingActivity}
            activeCurrencyOption={activeCurrencyOption}
            scrollableTarget="liquidity-wrapper-scrollable"
          />
        </TransactionsWrapper>
      </LiquidityWrapper>
    </AdvancedSwapModeContainer>
  )
}
