import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { OrderExpiresInUnit, LimitOrderContext } from '../../../../services/LimitOrders'
// import { LimitOrderContext } from '../../../../services/LimitOrders/LimitOrder.provider'

import { ButtonAddonsWrapper, InnerWrapper, Input, InputGroup, Label } from './InputGroup'

const invalidChars = ['-', '+', 'e']

export const ExpiryUnitButton = styled.span<{
  isActive: boolean
}>`
  color: #464366;
  cursor: pointer;
  ${({ isActive }) => isActive && `color: #8780BF;`};
  min-height: 22px;
`

const ExpiryLabels = styled(Label)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 19px;
`

export const MaxExpiryTime = styled.button`
  font-size: 11px;
  color: #8780bf;
  border: none;
  cursor: pointer;
  background-color: #2d3145;
  border-radius: 5px;
  text-transform: uppercase;
  padding: 3px 8px;
  &:hover {
    color: #736f96;
  }
`

export function OrderExpiryField() {
  const protocol = useContext(LimitOrderContext)
  const { expiresAt, expiresAtUnit } = protocol

  const [inputExpiresIn, setInputExpiresIn] = useState<string | number>(expiresAt)
  const [inputExpiresUnit, setInputExpiresUnit] = useState<OrderExpiresInUnit>(expiresAtUnit)
  const { t } = useTranslation('swap')

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
        setInputExpiresIn(value)
      }
    }
  }

  useEffect(() => {
    if (inputExpiresIn !== '' && parseFloat(inputExpiresIn.toString()) > 0) {
      protocol.onExpireChange(parseFloat(inputExpiresIn.toString()))
    }
  }, [inputExpiresIn, protocol])

  useEffect(() => {
    protocol.onExpireUnitChange(inputExpiresUnit)
  }, [inputExpiresUnit, protocol])

  return (
    <InputGroup>
      <ExpiryLabels htmlFor="limitOrderExpiry">
        <span>{t('limitOrder.expiresIn')}</span>
      </ExpiryLabels>
      <InnerWrapper>
        <Input
          value={inputExpiresIn}
          id="limitOrderExpiry"
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
          type="number"
          onChange={expiresInChangeHandler}
          required
        />
        <ButtonAddonsWrapper>
          <ExpiryUnitButton
            role="button"
            isActive={inputExpiresUnit === OrderExpiresInUnit.Minutes}
            onClick={() => setInputExpiresUnit(OrderExpiresInUnit.Minutes)}
          >
            Min
          </ExpiryUnitButton>
          <ExpiryUnitButton
            role="button"
            isActive={inputExpiresUnit === OrderExpiresInUnit.Days}
            onClick={() => setInputExpiresUnit(OrderExpiresInUnit.Days)}
          >
            Days
          </ExpiryUnitButton>
        </ButtonAddonsWrapper>
      </InnerWrapper>
    </InputGroup>
  )
}
