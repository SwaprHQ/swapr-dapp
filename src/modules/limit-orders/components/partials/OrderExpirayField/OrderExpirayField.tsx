import { useContext } from 'react'
import styled from 'styled-components'

import { LimitOrderFormContext } from '../../../contexts'
import { OrderExpiresInUnit } from '../../../interfaces'
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

export interface OnChangeParams {
  expiresIn: number
}

export interface OrderExpirayFieldProps {
  id?: string
}

export function OrderExpirayField({ id }: OrderExpirayFieldProps) {
  const { expiresIn, setExpiresIn, expiresInUnit, setExpiresInUnit } = useContext(LimitOrderFormContext)

  const expiresInChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const newExpiresIn = parseInt(event.target.value)
    // Update local state
    setExpiresIn(newExpiresIn)
  }

  return (
    <InputGroup>
      <Label htmlFor={id}>Expires In</Label>
      <InnerWrapper>
        <Input
          value={expiresIn}
          id={id}
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
            role="button"
            isActive={expiresInUnit === OrderExpiresInUnit.Minutes}
            onClick={() => setExpiresInUnit(OrderExpiresInUnit.Minutes)}
          >
            Min
          </ExpiryUnitButton>
          <ExpiryUnitButton
            role="button"
            isActive={expiresInUnit === OrderExpiresInUnit.Days}
            onClick={() => setExpiresInUnit(OrderExpiresInUnit.Days)}
          >
            Days
          </ExpiryUnitButton>
        </ButtonAddonsWrapper>
      </InnerWrapper>
    </InputGroup>
  )
}
