import styled from 'styled-components'

import { ReactComponent as EtherLogoSVG } from '../../../assets/swapbox/currency-logo-eth.svg'
import { ReactComponent as DownArrowLargeSVG } from '../../../assets/swapbox/down-arrow-large.svg'
import { ReactComponent as EtherSVG } from '../../../assets/swapbox/ether.svg'
import {
  ELEMENTS_BACKGROUND_PRIMARY,
  ELEMENTS_BACKGROUND_SECONDARY,
  ELEMENTS_BORDER_PRIMARY,
  ELEMENTS_BORDER_SECONDARY,
  ELEMENTS_SPACING,
  TEXT_COLOR_PRIMARY,
  TEXT_COLOR_SECONDARY,
} from '../constants'
import { BorderStyle, FontFamily } from './styles'

type CurrencyItemProps = {
  lowerItem?: boolean
}

export function CurrencyItem({ lowerItem }: CurrencyItemProps) {
  return (
    <CurrencyContainer lowerItem={lowerItem}>
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
      {/* <Blockchain>
        <EtherSVG />
      </Blockchain> */}
    </CurrencyContainer>
  )
}

const CurrencyContainer = styled.div<{ lowerItem?: boolean }>`
  width: 100%;
  height: 100px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 22px;
  background: ${({ lowerItem }) => (lowerItem ? ELEMENTS_BACKGROUND_SECONDARY : ELEMENTS_BACKGROUND_PRIMARY)};
  ${BorderStyle}
  margin-bottom: ${ELEMENTS_SPACING};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: ${({ lowerItem }) => (lowerItem ? ELEMENTS_BORDER_SECONDARY : ELEMENTS_BORDER_PRIMARY)};
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
`

const ValueContainer = styled.div`
  width: 100%;
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
  color: ${TEXT_COLOR_PRIMARY};
  margin-bottom: 5px;
`

const CurrencyAmountWorth = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  color: ${TEXT_COLOR_SECONDARY};
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
  color: ${TEXT_COLOR_PRIMARY};
  margin: 0 6px;
`

const CurrencyBalance = styled.p`
  line-height: 12px;
  font-size: 10px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${TEXT_COLOR_SECONDARY};

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
  border: 1px solid #1B1B2A;
  filter: drop-shadow(0px 4px 42px rgba(0, 0, 0, 0.16));
  backdrop-filter: blur(11px);
  cursor: pointer;
`
