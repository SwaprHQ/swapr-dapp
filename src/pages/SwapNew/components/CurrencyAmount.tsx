import { ChangeEvent } from 'react'
import styled from 'styled-components'

import { TEXT_COLOR_PRIMARY } from '../constants'
import { FontFamily } from './styles'

type CurrencyAmountProps = {
  value: number
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export function CurrencyAmount({ value, onChange }: CurrencyAmountProps) {
  return (
    <StyledInput
      value={value}
      onChange={onChange}
      type="number"
      inputMode="decimal"
      autoComplete="off"
      autoCorrect="off"
      pattern="^[0-9]*[.,]?[0-9]*$"
      placeholder="0.0"
      minLength={1}
      maxLength={79}
      spellCheck="false"
    />
  )
}

const StyledInput = styled.input`
  width: 250px;
  height: 34px;
  line-height: 34px;
  font-size: 28px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.02em;
  text-shadow: 0px 0px 12px rgba(255, 255, 255, 0.14);
  color: ${TEXT_COLOR_PRIMARY};
  background-color: transparent;
  border: none;
  outline: none;
  margin-bottom: 5px;
`
