import { CoWTrade, Trade, TradeType, Percent } from '@swapr/sdk'

import styled from 'styled-components'

import { ROUTABLE_PLATFORM_LOGO } from '../../../../constants'
import { PRICE_IMPACT_MEDIUM } from '../../../../constants'
import { Field } from '../../../../state/swap/types'
import { limitNumberOfDecimalPlaces } from '../../../../utils/prices'
import { computeSlippageAdjustedAmounts } from '../../../../utils/prices'
import { simpleWarningSeverity } from '../../../../utils/prices'
import { computeTradePriceBreakdown } from '../../../../utils/prices'
import {
  DEX_SELECTED_BORDER,
  DEX_UNSELECTED_BORDER,
  IndicatorColorVariant,
  IndicatorIconVariant,
  TEXT_COLOR_PRIMARY,
  BorderStyle,
  SWAP_PLATFORM_INFO_ITEM_COLOR_DEFAULT,
  SWAP_PLATFORM_INFO_ITEM_COLOR_POSITIVE,
  SWAP_PLATFORM_INFO_ITEM_COLOR_NEGATIVE,
} from '../../constants'
import { Indicator } from './Indicator'

type SwapDexInfoItemProps = {
  bestRoute: boolean
  isSelected: boolean
  trade: Trade
  outputCurrencySymbol?: string
  onClick: () => void
}

export function SwapDexInfoItem({
  bestRoute,
  isSelected = false,
  trade,
  outputCurrencySymbol,
  onClick,
}: SwapDexInfoItemProps) {
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade)
  const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)

  const tokenAmount = limitNumberOfDecimalPlaces(
    isExactIn ? slippageAdjustedAmounts[Field.OUTPUT] : slippageAdjustedAmounts[Field.INPUT]
  )

  return (
    <Container
      isSelected={isSelected}
      danger={simpleWarningSeverity(priceImpactWithoutFee) >= PRICE_IMPACT_MEDIUM}
      onClick={onClick}
    >
      <DexInfo isSelected={isSelected}>
        <Dex>
          {ROUTABLE_PLATFORM_LOGO[trade.platform.name]}
          <TextLabel>{trade.platform.name}</TextLabel>
        </Dex>
        {bestRoute && isSelected && <BestRouteLabel>Best Route Selected</BestRouteLabel>}
      </DexInfo>
      <TransactionInfo isSelected={isSelected}>
        <IndicatorsContainer>
          <Indicator color={IndicatorColorVariant.WARNING} icon={IndicatorIconVariant.GAS} />
          {trade instanceof CoWTrade && (
            <Indicator
              color={IndicatorColorVariant.POSITIVE}
              icon={IndicatorIconVariant.SHIELD}
              text={isSelected ? 'PROTECTED' : ''}
            />
          )}
        </IndicatorsContainer>
        <TransactionCost>
          {tokenAmount === '0' ? '<0.0000001' : `${tokenAmount} ${outputCurrencySymbol}`}
        </TransactionCost>
      </TransactionInfo>
    </Container>
  )
}

type ContainerProps = {
  isSelected: boolean
  danger?: boolean
}

const Container = styled.div<ContainerProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  ${BorderStyle}
  background: ${({ isSelected, danger }) =>
    isSelected
      ? danger
        ? SWAP_PLATFORM_INFO_ITEM_COLOR_NEGATIVE
        : SWAP_PLATFORM_INFO_ITEM_COLOR_POSITIVE
      : SWAP_PLATFORM_INFO_ITEM_COLOR_DEFAULT};
  background-blend-mode: normal, overlay, normal;
  opacity: 0.8;
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  margin-bottom: 8px;
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: ${({ isSelected }) => (isSelected ? DEX_SELECTED_BORDER : DEX_UNSELECTED_BORDER)};
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }

  ${({ isSelected }) =>
    isSelected &&
    `
    flex-direction: column;
    gap: 18px;
  `}
`

const DexInfo = styled.div<{ isSelected: boolean }>`
  height: 20px;
  display: flex;
  align-items: center;
  ${({ isSelected }) =>
    isSelected &&
    `
    width: 100%;
    justify-content: space-between;
  `}
`

const Dex = styled.div`
  display: flex;
  align-items: center;
`

const BestRouteLabel = styled.p`
  height: 17px;
  display: inline-block;
  padding: 3px 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0e9f6e;
  background: rgba(14, 159, 110, 0.15);
  border-radius: 4px;
`

const TextLabel = styled.p`
  display: inline-block;
  line-height: 15px;
  font-size: 14px;
  font-weight: 600;
  font-feature-settings: 'zero' on;
  color: ${TEXT_COLOR_PRIMARY};
  margin-left: 8px;
`

const TransactionInfo = styled.div<{ isSelected: boolean }>`
  height: 20px;
  display: flex;
  ${({ isSelected }) =>
    isSelected &&
    `
    width: 100%;
    justify-content: space-between;
  `};
`

const IndicatorsContainer = styled.div``

const TransactionCost = styled.p`
  height: 20px;
  line-height: 12px;
  display: inline-block;
  padding: 4px;
  font-size: 14px;
  background: rgba(104, 110, 148, 0.1);
  border-radius: 4px;
`
