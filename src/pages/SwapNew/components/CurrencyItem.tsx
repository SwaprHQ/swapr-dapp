import styled from 'styled-components'

import { ReactComponent as EtherLogoSVG } from '../../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as DownArrowLargeSVG } from '../../../assets/swapbox/down-arrow-large.svg'
import { ReactComponent as EtherSVG } from '../../../assets/swapbox/ether.svg'
import { SWAPBOX_ELEMENTS_BACKGROUND, SWAPBOX_ELEMENTS_SPACING } from '../constants'
import { BorderStyle, FontFamily } from './styles'

export function CurrencyItem() {
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

const CurrencyContainer = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 8px 8px 22px;
  background: ${SWAPBOX_ELEMENTS_BACKGROUND};
  ${BorderStyle}
  margin-bottom: ${SWAPBOX_ELEMENTS_SPACING};
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
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0px 0px 12px rgba(255, 255, 255, 0.14);
  color: #ffffff;
  margin-bottom: 5px;
`

const CurrencyAmountWorth = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
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
  ${FontFamily}
  font-weight: 600;
  text-transform: uppercase;
  color: #ffffff;
  margin: 0 6px;
`

const CurrencyBalance = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
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
  ${BorderStyle}
  filter: drop-shadow(0px 4px 42px rgba(0, 0, 0, 0.16));
  backdrop-filter: blur(11px);
`
