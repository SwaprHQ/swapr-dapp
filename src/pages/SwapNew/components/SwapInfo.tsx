import { useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../../assets/swapbox/dexes.svg'
import { ReactComponent as DownArrowSmallSVG } from '../../../assets/swapbox/down-arrow-small.svg'
import { ReactComponent as GasSVG } from '../../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../../assets/swapbox/shield.svg'
import { ELEMENTS_SPACING, TEXT_COLOR_PRIMARY } from '../constants'
import { BorderStyle, FontFamily } from './styles'
import { SwapDexInfoItem } from './SwapDexInfoItem'

export function SwapInfo() {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  return (
    <SwapInfoContainer>
      <SwapInfoBasics>
        <SwapCostInfo>
          <SwapInfoButton>
            <DexesSVG />
          </SwapInfoButton>
          <SwapInfoButton>
            <GasSVG />
          </SwapInfoButton>
          <SwapInfoButton>
            <BananaSVG />
          </SwapInfoButton>
          <SwapInfoButton>
            <ShieldSVG />
          </SwapInfoButton>
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
  background: radial-gradient(160.32% 118.69% at 50.64% 100%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(19, 19, 32, 0.5);
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  overflow: hidden;
  margin-bottom: ${ELEMENTS_SPACING};
`

const SwapInfoBasics = styled.div`
  width: 100%;
  height: 41px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SwapInfoDetailed = styled.div<{ showSwapInfoDetails: boolean }>``

const SwapCostInfo = styled.div``

const SwapInfoButton = styled.button`
  height: 20px;
  display: inline-flex;
  align-items: center;
  padding: 5px;
  background: rgba(14, 159, 110, 0.08);
  border-radius: 4px;
  border: 1px solid rgba(14, 159, 110, 0.65);
  box-shadow: 0px 0px 8px rgba(16, 158, 110, 0.15);
  margin-right: 4px;
`

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
