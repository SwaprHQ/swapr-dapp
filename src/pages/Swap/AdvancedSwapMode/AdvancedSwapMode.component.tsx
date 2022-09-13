import { FC, PropsWithChildren, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Text } from 'rebass'

import { ButtonDark } from '../../../components/Button'
import { useAdvancedTradingView } from '../../../services/AdvancedTradingView/useAdvancedTradingView.hook'
import { useAllTrades } from '../../../services/AdvancedTradingView/useAllTrades.hook'
import {
  AdvancedModeDetails,
  AdvancedModeHeader,
  AdvancedModeTitle,
  AdvancedSwapModeContainer,
  BaseWrapper,
  ChartWrapper,
  LiquidityWrapper,
  OrdersWrapper,
  SwapBox,
  SwitchButton,
  SwitcherWrapper,
  TransactionsWrapper,
} from './AdvancedSwapMode.styles'
import { Chart } from './Chart'
import { InfiniteScroll } from './InfiniteScroll'

export const AdvancedSwapMode: FC<PropsWithChildren> = ({ children }) => {
  const {
    tradeHistory,
    liquidityHistory,
    hasMore: { hasMoreTrades, hasMoreActivity },
  } = useAllTrades()

  const {
    chainId,
    inputToken,
    outputToken,
    symbol,
    showTrades,
    isLoadingTrades,
    isLoadingActivity,
    fetchTrades,
    fetchActivity,
    pairTokens,
    activeSwitchOption,
    handleAddLiquidity,
    handleSwitchCurrency,
  } = useAdvancedTradingView()

  const [token0, token1] = pairTokens

  const { t } = useTranslation('swap')
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
            {showTrades && !!pairTokens.length && activeSwitchOption && (
              <SwitcherWrapper>
                <SwitchButton
                  onClick={() => handleSwitchCurrency(token0)}
                  active={activeSwitchOption.address === token0.address}
                >
                  {token0.symbol}
                </SwitchButton>
                <SwitchButton
                  onClick={() => handleSwitchCurrency(token1)}
                  active={activeSwitchOption.address === token1.address}
                >
                  {token1.symbol}
                </SwitchButton>
              </SwitcherWrapper>
            )}
          </Flex>
          <AdvancedModeDetails>
            <Text>
              {t('details.amount')} {inputToken?.symbol ? inputToken.symbol : ''}
            </Text>
            <Text>
              {t('details.amount')} {outputToken?.symbol ? outputToken.symbol : ''}
            </Text>
            <Text>
              {t('details.price')} {activeSwitchOption?.symbol ? activeSwitchOption?.symbol : ''}
            </Text>
            <Text sx={{ textAlign: 'right' }}>{t('details.time')}</Text>
          </AdvancedModeDetails>
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
            activeSwitchOption={activeSwitchOption}
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
            <AdvancedModeTitle>{t('column.openOrder')}</AdvancedModeTitle>
            <AdvancedModeTitle style={{ marginLeft: '20px', fontWeight: '400' }}>
              {t('column.orderHistory')}
            </AdvancedModeTitle>
          </Flex>
          <AdvancedModeDetails>
            <Text>{t('details.price')}</Text>
            <Text>{t('details.amount')}</Text>
            <Text>{t('details.amount')}</Text>
            <Text sx={{ textAlign: 'right' }}>{t('details.time')}</Text>
          </AdvancedModeDetails>
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
              Add Liquidity
            </ButtonDark>
          </Flex>
          <AdvancedModeDetails>
            <Text>Amount {token0?.symbol ? `(${token0.symbol})` : ''}</Text>
            <Text>Amount {token1?.symbol ? `(${token1.symbol})` : ''}</Text>
            <Text sx={{ textAlign: 'right' }}>Time</Text>
          </AdvancedModeDetails>
        </AdvancedModeHeader>
        <TransactionsWrapper maxHeight="160px" id="liquidity-wrapper-scrollable">
          <InfiniteScroll
            token0={token0}
            chainId={chainId}
            data={liquidityHistory}
            showTrades={showTrades}
            fetchMore={fetchActivity}
            hasMore={hasMoreActivity}
            isLoading={isLoadingActivity}
            activeSwitchOption={activeSwitchOption}
            scrollableTarget="liquidity-wrapper-scrollable"
          />
        </TransactionsWrapper>
      </LiquidityWrapper>
    </AdvancedSwapModeContainer>
  )
}
