import { Trade } from '@swapr/sdk'

import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as DownArrowSmallSVG } from '../../../../assets/swapbox/down-arrow-small.svg'
import {
  ELEMENTS_BACKGROUND_SECONDARY,
  ELEMENTS_BORDER_SECONDARY,
  ELEMENTS_SPACING,
  IndicatorColorVariant,
  IndicatorIconVariant,
  TEXT_COLOR_PRIMARY,
} from '../../constants'
import { BorderStyle, FontFamily } from '../styles'
import { Indicator } from './Indicator'
import { SwapInfoDetailed } from './SwapInfoDetailed'

type SwapInfoProps = {
  loading: boolean
  allPlatformTrades?: (Trade | undefined)[]
  selectedTrade?: Trade
  outputCurrencySymbol?: string
}

export function SwapInfo({ loading, allPlatformTrades, selectedTrade, outputCurrencySymbol }: SwapInfoProps) {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  console.log('trades', allPlatformTrades)

  return (
    <SwapInfoContainer>
      <SwapInfoBasics>
        <SwapCostInfo>
          <Indicator color={IndicatorColorVariant.POSITIVE} icon={IndicatorIconVariant.DEXES} text="92/92" />
          <Indicator color={IndicatorColorVariant.WARNING} icon={IndicatorIconVariant.GAS} />
          <Indicator color={IndicatorColorVariant.NEGATIVE} icon={IndicatorIconVariant.BANANA} />
          <Indicator color={IndicatorColorVariant.UNDEFINED} icon={IndicatorIconVariant.SHIELD} />
          <CurrencyCourseInfo>
            <span>1</span> ETH = <span>3007</span> USDT
          </CurrencyCourseInfo>
        </SwapCostInfo>
        <ExpandButton onClick={() => setShowSwapInfoDetails(value => !value)}>
          <DownArrowSmallSVG />
        </ExpandButton>
      </SwapInfoBasics>

      <AnimatePresence>
        {showSwapInfoDetails && allPlatformTrades?.length !== 0 && (
          <SwapInfoDetailed
            loading={loading}
            allPlatformTrades={allPlatformTrades}
            selectedTrade={selectedTrade}
            outputCurrencySymbol={outputCurrencySymbol}
          />
        )}
      </AnimatePresence>
    </SwapInfoContainer>
  )
}

// TODO: PULL OUT THE CONSTANTS

const SwapInfoContainer = styled.div`
  padding: 9px 12px;
  ${BorderStyle}
  background: ${ELEMENTS_BACKGROUND_SECONDARY};
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  overflow: hidden;
  margin-bottom: ${ELEMENTS_SPACING};

  &::before {
    content: '';
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: ${ELEMENTS_BORDER_SECONDARY};
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
`

const SwapInfoBasics = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SwapCostInfo = styled.div``

const ExpandButton = styled.button`
  height: 20px;
  width: 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: transparent;
  border-radius: 4px;
  border: none;
  cursor: pointer;
`

const CurrencyCourseInfo = styled.p`
  height: 20px;
  line-height: 20px;
  display: inline-block;
  vertical-align: top;
  padding: 5px 6px;
  border-radius: 4px;
  line-height: 10px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 500;
  text-transform: uppercase;
  opacity: 0.8;
  color: ${TEXT_COLOR_PRIMARY};
  background: rgba(104, 110, 148, 0.1);

  & span {
    opacity: 1;
    font-weight: 700;
  }
`
