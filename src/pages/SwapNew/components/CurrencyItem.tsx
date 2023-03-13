import { Currency, CurrencyAmount as CurrencyAmountType, Percent } from '@swapr/sdk'

import { useState } from 'react'
import styled from 'styled-components'

import {
  ELEMENTS_BACKGROUND_PRIMARY,
  ELEMENTS_BACKGROUND_SECONDARY,
  ELEMENTS_BORDER_PRIMARY,
  ELEMENTS_BORDER_SECONDARY,
  ELEMENTS_SPACING,
} from '../constants'
import { CurrencyAmount } from './CurrencyAmount'
import { CurrencyAmountWorth } from './CurrencyAmountWorth'
import { CurrencyBalance } from './CurrencyBalance'
import { CurrencyType } from './CurrencyType'
import { BorderStyle } from './styles'
import { TokenPicker } from './TokenPicker'

type CurrencyItemProps = {
  currency?: Currency
  value: string
  onUserInput: (value: string) => void
  fiatValue?: CurrencyAmountType | null
  isFallbackFiatValue?: boolean
  priceImpact?: Percent
  onMax?: () => void
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
  lowerItem?: boolean
}

export function CurrencyItem({
  currency,
  value,
  onUserInput,
  fiatValue,
  isFallbackFiatValue,
  priceImpact,
  onMax,
  onCurrencySelect,
  lowerItem,
}: CurrencyItemProps) {
  const [isMaxAmount, setIsMaxAmount] = useState(false)
  const [tokenPickerOpened, setTokenPickerOpened] = useState(false)

  return (
    <CurrencyContainer lowerItem={lowerItem}>
      <CurrencyAmountContainer>
        <CurrencyAmount value={value} onUserInput={onUserInput} setIsMaxAmount={setIsMaxAmount} />
        <CurrencyAmountWorth fiatValue={fiatValue} priceImpact={priceImpact} isFallback={isFallbackFiatValue} />
      </CurrencyAmountContainer>

      <CurrencyInfoContainer>
        <CurrencyType onClick={() => setTokenPickerOpened(true)} currency={currency} />
        <CurrencyBalance currency={currency} />
      </CurrencyInfoContainer>
      {tokenPickerOpened && (
        <TokenPicker
          isMaxAmount={isMaxAmount}
          onCurrencySelect={onCurrencySelect}
          closeTokenPicker={() => setTokenPickerOpened(false)}
        />
      )}
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

const CurrencyAmountContainer = styled.div`
  width: 40%;
`

const CurrencyInfoContainer = styled.div`
  width: 60%;
`
