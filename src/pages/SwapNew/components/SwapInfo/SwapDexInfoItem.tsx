import { Trade, TradeType } from '@swapr/sdk'

import styled from 'styled-components'

import { ROUTABLE_PLATFORM_LOGO } from '../../../../constants'
import { Field } from '../../../../state/swap/types'
import { limitNumberOfDecimalPlaces } from '../../../../utils/prices'
import { computeSlippageAdjustedAmounts } from '../../../../utils/prices'
import {
  DEX_SELECTED_BORDER,
  DEX_UNSELECTED_BORDER,
  IndicatorColorVariant,
  IndicatorIconVariant,
  TEXT_COLOR_PRIMARY,
} from '../../constants'
import { BorderStyle, FontFamily } from '../styles'
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

  const tokenAmount = limitNumberOfDecimalPlaces(
    isExactIn ? slippageAdjustedAmounts[Field.OUTPUT] : slippageAdjustedAmounts[Field.INPUT]
  )

  return (
    <Container isSelected={isSelected} onClick={onClick}>
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
        </IndicatorsContainer>
        <TransactionCost>
          {tokenAmount === '0' ? '<0.0000001' : `${tokenAmount} ${outputCurrencySymbol}` || '-'}
        </TransactionCost>
      </TransactionInfo>
    </Container>
  )
}

const Container = styled.div<{ isSelected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  ${BorderStyle}
  background: ${({ isSelected }) =>
    isSelected
      ? 'linear-gradient(180deg, rgba(15, 152, 106, 0.2) -16.91%, rgba(15, 152, 106, 0) 116.18%), linear-gradient(113.18deg, rgba(255, 255, 255, 0.15) -0.1%, rgba(0, 0, 0, 0) 98.9%), rgba(23, 22, 33, 0.6);'
      : 'linear-gradient(180deg, rgba(68, 65, 99, 0.1) -16.91%, rgba(68, 65, 99, 0) 116.18%), linear-gradient(113.18deg, rgba(255, 255, 255, 0.2) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621'};
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
  ${FontFamily}
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
  ${FontFamily}
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
  ${FontFamily}
  background: rgba(104, 110, 148, 0.1);
  border-radius: 4px;
`
