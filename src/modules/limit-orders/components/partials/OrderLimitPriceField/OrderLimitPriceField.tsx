import { parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@swapr/sdk'

import { useContext } from 'react'
import { RefreshCw } from 'react-feather'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { LimitOrderFormContext } from '../../../contexts/LimitOrderFormContext'
import { LimitOrderKind } from '../../../interfaces'
import { computeLimitPrice } from '../../../utils'
import { InputGroup } from '../../InputGroup'

export const ToggleCurrencyButton = styled.span`
  color: #464366;
  cursor: pointer;
`

const SwapTokenIconWrapper = styled.div`
  margin-left: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  width: 24px;
  height: 22px;
  background: rgba(104, 110, 148, 0.3);
  border-radius: 4.25926px;
  color: #bcb3f0;
`

const SwapTokenWrapper = styled(Flex)`
  color: #8780bf;
  align-items: center;
  &:hover {
    color: #736f96;
    & > div {
      color: #736f96;
    }
  }
`

export interface OrderLimitPriceFieldProps {
  id?: string
}

export function OrderLimitPriceField({ id }: OrderLimitPriceFieldProps) {
  const { limitOrder, buyTokenAmount, sellTokenAmount, setLimitOrder, formattedLimitPrice, setFormattedLimitPrice } =
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

    //  const formattedComputedLimitPrice =
    //     kind === LimitOrderKind.SELL
    //       ? formatUnits(BigNumber.from(computeLimitPrice), baseTokenAmount.currency.decimals)
    //       : formatUnits(BigNumber.from(computeLimitPrice), quoteTokenAmount.currency.decimals)

    setLimitOrder({
      ...limitOrder,
      kind,
      limitPrice: computedlimitPrice.toString(),
    })
    // setFormattedLimitPrice(formattedComputedLimitPrice)
  }

  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const newFormattedLimitPrice = event.target.value ?? '0'
    if (Number(newFormattedLimitPrice) > 0) {
      const newBuyTokenAmount = new TokenAmount(
        buyTokenAmount.currency as Token,
        parseUnits(newFormattedLimitPrice, buyTokenAmount.currency.decimals).toString()
      )
      console.log({ newBuyTokenAmount })

      const [baseTokenAmount, quoteTokenAmount] =
        limitOrder.kind === LimitOrderKind.SELL
          ? [sellTokenAmount, newBuyTokenAmount]
          : [newBuyTokenAmount, sellTokenAmount]

      console.log({ baseTokenAmount, quoteTokenAmount })

      const computedlimitPrice = computeLimitPrice(baseTokenAmount, quoteTokenAmount)

      console.log({
        computedlimitPrice: computedlimitPrice,
      })

      // Update limit order
      setLimitOrder({
        ...limitOrder,
        limitPrice: computedlimitPrice,
      })
      // setFormattedBuyAmount(formatUnits(quoteAmountJSBI, quoteTokenAmount.currency.decimals).toString())
    }
    setFormattedLimitPrice(newFormattedLimitPrice)
  }

  return (
    <InputGroup>
      <InputGroup.Label htmlFor={id}>{inputGroupLabel}</InputGroup.Label>
      <InputGroup.InnerWrapper>
        <InputGroup.Input id={id} value={formattedLimitPrice} onChange={onChangeHandler} />
        <InputGroup.ButtonAddonsWrapper>
          <ToggleCurrencyButton onClick={toggleBaseCurrency}>
            <SwapTokenWrapper>
              {toggleCurrencyButtonLabel}
              <SwapTokenIconWrapper>
                <RefreshCw size={13} />
              </SwapTokenIconWrapper>
            </SwapTokenWrapper>
          </ToggleCurrencyButton>
        </InputGroup.ButtonAddonsWrapper>
      </InputGroup.InnerWrapper>
    </InputGroup>
  )
}
