import { useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as DownArrowSmallSVG } from '../../../assets/swapbox/down-arrow-small.svg'
import { ELEMENTS_BACKGROUND_SECONDARY, ELEMENTS_SPACING, TEXT_COLOR_PRIMARY } from '../constants'
import { Indicator, IndicatorVariant } from './Indicator'
import { BorderStyle, FontFamily } from './styles'
import { SwapDexInfoItem } from './SwapDexInfoItem'

export function SwapInfo() {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  return (
    <SwapInfoContainer>
      <SwapInfoBasics>
        <SwapCostInfo>
          <Indicator variant={IndicatorVariant.WARNING} icon="dexes" />
          <Indicator variant={IndicatorVariant.WARNING} icon="gas" />
          <Indicator variant={IndicatorVariant.WARNING} icon="banana" />
          <Indicator variant={IndicatorVariant.WARNING} icon="shield" />
          <CurrencyCourseInfo>
            <span>1</span> ETH = <span>3007</span> USDT
          </CurrencyCourseInfo>
        </SwapCostInfo>
        <ExpandButton onClick={() => setShowSwapInfoDetails(value => !value)}>
          <DownArrowSmallSVG />
        </ExpandButton>
      </SwapInfoBasics>

      {showSwapInfoDetails && (
        <SwapInfoDetailed showSwapInfoDetails={showSwapInfoDetails}>
          <SwapDexInfoItem />
          <SwapDexInfoItem />
          <SwapDexInfoItem />
        </SwapInfoDetailed>
      )}
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
`

const SwapInfoBasics = styled.div`
  width: 100%;
  height: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SwapInfoDetailed = styled.div<{ showSwapInfoDetails: boolean }>`
  margin-top: 9px;
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
