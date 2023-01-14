import { useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../assets/swapbox/banana.svg'
import { ReactComponent as DexesSVG } from '../../assets/swapbox/dexes.svg'
import { ReactComponent as DownArrowSmallSVG } from '../../assets/swapbox/down-arrow-small.svg'
import { ReactComponent as GasSVG } from '../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../assets/swapbox/shield.svg'
import { CurrencyItem, SwapButton, SwitchCurrenciesButton } from './components'
import { SharedStyles } from './components/styles'

export function Swapbox2() {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  return (
    <Container>
      <CurrencyItem />
      <CurrencyItem />
      <SwitchCurrenciesButton />

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

        <SwapInfoDetailed showSwapInfoDetails={showSwapInfoDetails}>
          {showSwapInfoDetails && (
            <>
              <SwapDexInfoItem />
              <SwapDexInfoItem />
              <SwapDexInfoItem />
            </>
          )}
        </SwapInfoDetailed>
      </SwapInfoContainer>
      <SwapButton />
    </Container>
  )
}

const Container = styled.div`
  width: 467px;
  position: relative;
`

const SwapInfoContainer = styled.div`
  padding: 9px 12px;
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
  background: radial-gradient(160.32% 118.69% at 50.64% 100%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(19, 19, 32, 0.5);
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  overflow: hidden;
  margin-bottom: 6px;
`

const SwapInfoBasics = styled.div`
  width: 100%;
  height: 41px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const SwapInfoDetailed = styled.div<{ showSwapInfoDetails: boolean }>`
  height: ${({ showSwapInfoDetails }) => (showSwapInfoDetails ? '100px' : '0px')};
  transition: height 0.15s ease-out;
`

const SwapDexInfoItem = styled.div`
  padding: 16px;
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
  background: linear-gradient(180deg, rgba(68, 65, 99, 0.1) -16.91%, rgba(68, 65, 99, 0) 116.18%),
    linear-gradient(113.18deg, rgba(255, 255, 255, 0.2) -0.1%, rgba(0, 0, 0, 0) 98.9%), #171621;
  background-blend-mode: normal, overlay, normal;
  opacity: 0.8;
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  margin-bottom: 8px;
`

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
  ${SharedStyles}
  font-weight: 500;
  text-transform: uppercase;
  opacity: 0.8;
  color: #ffffff;
  background: rgba(104, 110, 148, 0.1);

  & span {
    opacity: 1;
    font-weight: 700;
  }
`
