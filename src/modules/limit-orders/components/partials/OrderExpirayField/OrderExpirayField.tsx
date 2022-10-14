import { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { LimitOrderFormContext } from '../../../contexts'
import { OrderExpiresInUnit } from '../../../interfaces'
import { ButtonAddonsWrapper, InnerWrapper, Input, InputGroup, Label } from '../../InputGroup'

export const ExpiryUnitButton = styled.span<{
  isActive: boolean
}>`
  color: #464366;
  cursor: pointer;
  ${({ isActive }) => isActive && `color: #8780BF;`};
`

const invalidChars = ['-', '+', 'e']

export interface OnChangeParams {
  expiresIn: number
}

export interface OrderExpirayFieldProps {
  id?: string
}

export function OrderExpirayField({ id }: OrderExpirayFieldProps) {
  const { expiresIn, setExpiresIn, expiresInUnit, setExpiresInUnit } = useContext(LimitOrderFormContext)
  const [inputExpiresIn, setInputExpiresIn] = useState<string | number>(expiresIn)

  const expiresInChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const newExpiresIn = event.target.value

    // Update local state
    if (newExpiresIn === '') {
      setInputExpiresIn(newExpiresIn)
    } else {
      const value = parseFloat(newExpiresIn ?? 0)
      //Don't want to set negative time
      if (value >= 0) {
        // Max time can be set to 180 minutes only
        // Update this once CoW supports future time
        setInputExpiresIn(value < 180 ? value : 180)
      }
    }
  }

  useEffect(() => {
    if (inputExpiresIn !== '' && parseFloat(inputExpiresIn.toString()) > 0) {
      setExpiresIn(parseFloat(inputExpiresIn.toString()))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputExpiresIn])

  return (
    <InputGroup>
      <Label htmlFor={id}>Expires In</Label>
      <InnerWrapper>
        <Input
          value={inputExpiresIn}
          id={id}
          onKeyDown={e => {
            if (invalidChars.includes(e.key)) {
              e.preventDefault()
            }
          }}
          onBlur={e => {
            if (e.target.value === '' || e.target.value === '0') {
              setInputExpiresIn(1)
            }
          }}
          // Currently CoW supports only 180 minutes
          max={180}
          type="number"
          onChange={expiresInChangeHandler}
          required
        />
        <ButtonAddonsWrapper>
          <ExpiryUnitButton
            role="button"
            isActive={expiresInUnit === OrderExpiresInUnit.Minutes}
            onClick={() => setExpiresInUnit(OrderExpiresInUnit.Minutes)}
          >
            Min
          </ExpiryUnitButton>
          {/* <ExpiryUnitButton
            role="button"
            isActive={expiresInUnit === OrderExpiresInUnit.Days}
            onClick={() => setExpiresInUnit(OrderExpiresInUnit.Days)}
          >
            Days
          </ExpiryUnitButton> */}
        </ButtonAddonsWrapper>
      </InnerWrapper>
    </InputGroup>
  )
}
