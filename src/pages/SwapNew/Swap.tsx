import { useState } from 'react'
import styled, { css } from 'styled-components'

import { ReactComponent as BananaSVG } from '../../assets/swapbox/banana.svg'
import { ReactComponent as EtherLogoSVG } from '../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as CowSVG } from '../../assets/swapbox/dex-logo-cow.svg'
import { ReactComponent as DexesSVG } from '../../assets/swapbox/dexes.svg'
import { ReactComponent as DownArrowLargeSVG } from '../../assets/swapbox/down-arrow-large.svg'
import { ReactComponent as DownArrowSmallSVG } from '../../assets/swapbox/down-arrow-small.svg'
import { ReactComponent as EtherSVG } from '../../assets/swapbox/ether.svg'
import { ReactComponent as GasSVG } from '../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../assets/swapbox/shield.svg'
import { ReactComponent as SwapArrowSVG } from '../../assets/swapbox/swap-arrow.svg'

export function Swapbox2() {
  const [showSwapInfoDetails, setShowSwapInfoDetails] = useState(false)

  return (
    <Container>
      <CurrencyItem />
      <CurrencyItem />
      <SwapIndicatorButton>
        <SwapArrowSVG />
      </SwapIndicatorButton>

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

      <SwapButton>
        <SwapButtonLabel>Swap With</SwapButtonLabel>
        <CowSVG />
        <SwapButtonLabel>Cow</SwapButtonLabel>
      </SwapButton>
    </Container>
  )
}

function CurrencyItem() {
  return (
    <CurrencyContainer>
      <ValueContainer>
        <CurrencyAmountContainer>
          <CurrencyAmount>1.488</CurrencyAmount>
          <CurrencyAmountWorth>$4000</CurrencyAmountWorth>
        </CurrencyAmountContainer>

        <CurrencyInfoContainer>
          <CurrencyTypeContainer>
            <EtherLogoSVG />
            <CurrencySymbol>ETH</CurrencySymbol>
            <DownArrowLargeSVG />
          </CurrencyTypeContainer>
          <CurrencyBalance>
            Balance: <span>1.488</span>
          </CurrencyBalance>
        </CurrencyInfoContainer>
      </ValueContainer>
      <Blockchain>
        <EtherSVG />
      </Blockchain>
    </CurrencyContainer>
  )
}

const SharedStyles = css`
  font-family: Inter;
`

const Container = styled.div`
  width: 467px;
  position: relative;
`

const CurrencyContainer = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 8px 22px;
  background: radial-gradient(173.28% 128.28% at 50.64% 0%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(19, 19, 32, 0.5);
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
  margin-bottom: 6px;
`

const ValueContainer = styled.div`
  width: calc(100% - 56px);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const CurrencyAmountContainer = styled.div``

const CurrencyAmount = styled.p`
  line-height: 34px;
  font-size: 28px;
  ${SharedStyles}
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0px 0px 12px rgba(255, 255, 255, 0.14);
  color: #ffffff;
  margin-bottom: 5px;
`

const CurrencyAmountWorth = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${SharedStyles}
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #8780bf;
`

const CurrencyInfoContainer = styled.div``

const CurrencyTypeContainer = styled.div`
  height: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 17px;
`

const CurrencySymbol = styled.p`
  display: inline-block;
  line-height: 24px;
  font-size: 20px;
  ${SharedStyles}
  font-weight: 600;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 6px;
`

const CurrencyBalance = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${SharedStyles}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8780bf;

  & span {
    text-decoration: underline;
  }
`

const Blockchain = styled.a`
  width: 44px;
  height: 84px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
  filter: drop-shadow(0px 4px 42px rgba(0, 0, 0, 0.16));
  backdrop-filter: blur(11px);
`

const SwapIndicatorButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 50%;
  top: 84px;
  transform: translateX(-50%);
  background: #06060a;
  border-radius: 12px;
  border: 1px solid #0c0c14;
  box-shadow: 0px 0px 42px rgba(0, 0, 0, 0.42);
  backdrop-filter: blur(11px);
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

const SwapButton = styled.button`
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(93.39deg, #2b00a4 -8.9%, #d67b5a 114.08%);
  box-shadow: 0px 0px 42px rgba(129, 62, 127, 0.32);
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`

const SwapButtonLabel = styled.p`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  ${SharedStyles}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
`
