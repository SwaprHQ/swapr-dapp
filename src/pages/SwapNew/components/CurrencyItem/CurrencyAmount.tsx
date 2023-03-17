import { CurrencyAmount as CurrencyAmountType } from '@swapr/sdk'

import { ChangeEvent, useState, useMemo, useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { escapeRegExp, normalizeInputValue } from '../../../../utils'
import { debounce } from '../../../../utils/debounce'
import { TEXT_COLOR_PRIMARY } from '../../constants'
import { FontFamily } from '../styles'

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`)

type CurrencyAmountProps = {
  value: string | number
  onUserInput: (value: string) => void
  setIsMaxAmount: (value: boolean) => void
  maxAmount?: CurrencyAmountType
}

export function CurrencyAmount({ value, onUserInput, setIsMaxAmount, maxAmount }: CurrencyAmountProps) {
  const [inputValue, setInputValue] = useState(value)

  const handleOnUserInput = useCallback(
    (value: string) => {
      if (maxAmount?.toExact() === value) setIsMaxAmount(true)
      else setIsMaxAmount(false)

      onUserInput(value)
    },
    [maxAmount, onUserInput, setIsMaxAmount]
  )

  const debouncedUserInput = useMemo(() => {
    return debounce(handleOnUserInput, 250)
  }, [handleOnUserInput])

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation()

    const parsedValue = event.target.value.replace(/,/g, '.')

    if (parsedValue === '' || inputRegex.test(escapeRegExp(parsedValue))) {
      setInputValue(normalizeInputValue(parsedValue))
      debouncedUserInput(normalizeInputValue(parsedValue))
    }
  }

  useEffect(() => {
    if (inputValue !== value) {
      setInputValue(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <StyledInput
      value={inputValue}
      onChange={handleInputChange}
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
  width: 100%;
  height: 34px;
  line-height: 34px;
  font-size: 28px;
  ${FontFamily}
  font-weight: 600;
  letter-spacing: 0.02em;
  /* text-shadow: 0px 0px 12px rgba(255, 255, 255, 0.14); */
  color: ${TEXT_COLOR_PRIMARY};
  background-color: transparent;
  border: none;
  outline: none;
  margin-bottom: 5px;

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  [type='number'] {
    -moz-appearance: textfield;
  }
`
