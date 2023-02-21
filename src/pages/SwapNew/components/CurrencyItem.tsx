import styled from 'styled-components'

import { ReactComponent as DownArrowLargeSVG } from '../../../assets/swapbox/down-arrow-large.svg'
import {
  ELEMENTS_BACKGROUND_PRIMARY,
  ELEMENTS_BACKGROUND_SECONDARY,
  ELEMENTS_BORDER_PRIMARY,
  ELEMENTS_BORDER_SECONDARY,
  ELEMENTS_SPACING,
  TEXT_COLOR_PRIMARY,
  TEXT_COLOR_SECONDARY,
} from '../constants'
import { Currency } from '../models'
import { CurrencyAmount } from './CurrencyAmount'
import { CurrencyBalance } from './CurrencyBalance'
import { BorderStyle, FontFamily } from './styles'

type CurrencyItemProps = {
  currency: Currency
  value: string
  openTokenPicker: () => void
  onUserInput: (value: string) => void
  lowerItem?: boolean
}

export function CurrencyItem({ currency, value, openTokenPicker, onUserInput, lowerItem }: CurrencyItemProps) {
  return (
    <CurrencyContainer lowerItem={lowerItem}>
      <CurrencyAmountContainer>
        <CurrencyAmount value={value} onUserInput={onUserInput} />
        <CurrencyAmountWorth>$4000</CurrencyAmountWorth>
      </CurrencyAmountContainer>

      <CurrencyInfoContainer>
        <CurrencyTypeContainer onClick={openTokenPicker}>
          {currency.logo}
          <CurrencySymbol>{currency.symbol}</CurrencySymbol>
          <DownArrowLargeSVG />
        </CurrencyTypeContainer>
        <CurrencyBalance />
      </CurrencyInfoContainer>
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

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
    border-radius: 12px;
    border: 1.5px solid transparent;
    background: ${({ lowerItem }) => (lowerItem ? ELEMENTS_BORDER_SECONDARY : ELEMENTS_BORDER_PRIMARY)};
    mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
`

const CurrencyAmountContainer = styled.div``

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
  cursor: pointer;
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
