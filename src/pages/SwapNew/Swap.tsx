import styled from 'styled-components'

import { ReactComponent as BananaSVG } from '../../assets/swapbox/banana.svg'
import { ReactComponent as EtherLogoSVG } from '../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as CowSVG } from '../../assets/swapbox/dex-logo-cow.svg'
import { ReactComponent as DexesSVG } from '../../assets/swapbox/dexes.svg'
import { ReactComponent as DownArrowLargeSVG } from '../../assets/swapbox/down-arrow-large.svg'
import { ReactComponent as DownArrowSmallSVG } from '../../assets/swapbox/down-arrow-small.svg'
import { ReactComponent as EtherSVG } from '../../assets/swapbox/ether.svg'
import { ReactComponent as GasSVG } from '../../assets/swapbox/gas.svg'
import { ReactComponent as ShieldSVG } from '../../assets/swapbox/shield.svg'

export function Swapbox2() {
  return (
    <Container>
      <CurrencyItem />
      <CurrencyItem />
      <SwapInfoContainer>
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
        </SwapCostInfo>
        <DownArrowSmallSVG />
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

const Container = styled.div`
  width: 467px;
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
  font-family: Inter;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0px 0px 12px rgba(255, 255, 255, 0.14);
  color: #ffffff;
  margin-bottom: 5px;
`

const CurrencyAmountWorth = styled.p`
  line-height: 12px;
  font-size: 10px;
  font-family: 'Inter';
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
  font-family: 'Inter';
  font-weight: 600;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 6px;
`

const CurrencyBalance = styled.p`
  line-height: 12px;
  font-size: 10px;
  font-family: 'Inter';
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

const SwapInfoContainer = styled.div`
  width: 100%;
  height: 41px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 12px;
  border-radius: 12px;
  border: 1.5px solid #1b1b2a;
  background: radial-gradient(160.32% 118.69% at 50.64% 100%, rgba(170, 162, 255, 0.06) 0%, rgba(0, 0, 0, 0) 100%),
    rgba(19, 19, 32, 0.5);
  box-shadow: 0px 4px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(11px);
  margin-bottom: 6px;
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
`

const SwapButtonLabel = styled.p`
  display: inline-block;
  line-height: 16px;
  font-size: 13px;
  font-family: 'Inter';
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #ffffff;
`
