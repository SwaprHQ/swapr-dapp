import { useState } from 'react'
import styled from 'styled-components'

import { ButtonAddonsWrapper, InnerWrapper, Input, InputGroup, Label } from '../../InputGroup'

export const ExpiryUnitButton = styled.span<{
  isActive: boolean
}>`
  color: #464366;
  cursor: pointer;
  ${props =>
    props.isActive &&
    `
    color: #8780BF;
  `};
`

const invalidChars = ['-', '+', 'e']

export enum ExpiryUnit {
  Minutes = 'minutes',
  Days = 'days',
}

export interface OnChangeParams {
  expiresIn: number
  expiryUnit: ExpiryUnit
}

export interface OrderExpirayFieldProps {
  value?: number
  onChange?: (params: OnChangeParams) => void
}

export function LimitPriceField(params: OrderExpirayFieldProps) {
  const { value, onChange } = params

  // Local state
  const [expiryUnit, setExpiryUnit] = useState(ExpiryUnit.Minutes)
  const [expiresIn, setExpiresIn] = useState(value || 20)

  const expiresInChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const { value } = event.target
    // Update local state
    setExpiresIn(parseInt(value, 10))
    // Propagate change to parent component
    onChange &&
      onChange({
        expiresIn,
        expiryUnit,
      })
  }

  const expiryUnitChangeHandler = (expiryUnit: ExpiryUnit) => {
    // Update local state
    setExpiryUnit(expiryUnit)
    // Propagate change to parent component
    onChange &&
      onChange({
        expiresIn,
        expiryUnit,
      })
  }

  return (
    <InputGroup>
      <Label htmlFor="orderOxpiry">Expires In</Label>
      <InnerWrapper>
        <Input
          value={expiresIn}
          id="orderOxpiry"
          onKeyDown={e => {
            if (invalidChars.includes(e.key)) {
              e.preventDefault()
            }
          }}
          max={300}
          type="number"
          onChange={expiresInChangeHandler}
        />
        <ButtonAddonsWrapper>
          <ExpiryUnitButton
            isActive={expiryUnit === ExpiryUnit.Minutes}
            onClick={() => expiryUnitChangeHandler(ExpiryUnit.Minutes)}
          >
            Min
          </ExpiryUnitButton>
          <ExpiryUnitButton
            isActive={expiryUnit === ExpiryUnit.Days}
            onClick={() => expiryUnitChangeHandler(ExpiryUnit.Days)}
          >
            Days
          </ExpiryUnitButton>
        </ButtonAddonsWrapper>
      </InnerWrapper>
    </InputGroup>
  )
}
