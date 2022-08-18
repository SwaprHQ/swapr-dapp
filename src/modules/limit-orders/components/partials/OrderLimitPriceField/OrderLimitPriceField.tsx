import { parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@swapr/sdk'

import { useContext } from 'react'
import styled from 'styled-components'

import { LimitOrderFormContext } from '../../../contexts/LimitOrderFormContext'
import { LimitOrderKind } from '../../../interfaces'
import { computeLimitPrice } from '../../../utils'
import { InputGroup } from '../../InputGroup'

export const ToggleCurrencyButton = styled.span`
  color: #464366;
  cursor: pointer;
`

export interface OrderLimitPriceFieldProps {
  id?: string
}

export function OrderLimitPriceField({ id }: OrderLimitPriceFieldProps) {
  const { limitOrder, buyTokenAmount, sellTokenAmount, setLimitOrder, formattedLimitPrice, setBuyTokenAmount } =
    useContext(LimitOrderFormContext)

  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  // const quoteCurrencyAmount = limitOrder.kind === LimitOrderKind.SELL ? buyTokenAmount : sellTokenAmount

  const inputGroupLabel = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteTokenAmount?.currency?.symbol}`

  const toggleBaseCurrency = () => {
    // Toggle between buy and sell currency
    const kind = limitOrder.kind === LimitOrderKind.SELL ? LimitOrderKind.BUY : LimitOrderKind.SELL

    // Recompute the limit price
    const [baseTokenAmount, quoteTokenAmount] =
      kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]

    const computedlimitPrice = computeLimitPrice(baseTokenAmount, quoteTokenAmount)

    console.log({ computedlimitPrice })

    setLimitOrder({
      ...limitOrder,
      kind,
      limitPrice: computedlimitPrice.toString(),
    })
  }

  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const newFormattedLimitPrice = event.target.value

    const newBuyTokenAmount = new TokenAmount(
      buyTokenAmount.currency as Token,
      parseUnits(newFormattedLimitPrice, buyTokenAmount.currency.decimals).toString()
    )

    const [baseTokenAmount, quoteTokenAmount] =
      limitOrder.kind === LimitOrderKind.SELL
        ? [sellTokenAmount, newBuyTokenAmount]
        : [newBuyTokenAmount, sellTokenAmount]

    const computedlimitPrice = computeLimitPrice(baseTokenAmount, quoteTokenAmount)

    console.log({
      computedlimitPrice,
    })

    // Update limit order
    setLimitOrder({
      ...limitOrder,
      limitPrice: computedlimitPrice.toString(),
    })
  }

  return (
    <InputGroup>
      <InputGroup.Label htmlFor={id}>{inputGroupLabel}</InputGroup.Label>
      <InputGroup.InnerWrapper>
        <InputGroup.Input id={id} value={formattedLimitPrice} onChange={onChangeHandler} />
        <InputGroup.ButtonAddonsWrapper>
          <ToggleCurrencyButton onClick={toggleBaseCurrency}>
            <>{toggleCurrencyButtonLabel}</>
          </ToggleCurrencyButton>
        </InputGroup.ButtonAddonsWrapper>
      </InputGroup.InnerWrapper>
    </InputGroup>
  )
}
