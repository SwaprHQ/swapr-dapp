import { formatUnits, parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@swapr/sdk'

import { useContext } from 'react'
import { RefreshCw } from 'react-feather'

import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { LimitOrderKind } from '../../interfaces'
import { debug } from '../../utils'
import { InputGroup } from '../InputGroup'
import { LimitLabel, SwapTokenIconWrapper, SwapTokenWrapper, ToggleCurrencyButton } from './styles'

export interface OrderLimitPriceFieldProps {
  id?: string
}

export function OrderLimitPriceField({ id }: OrderLimitPriceFieldProps) {
  const {
    limitOrder,
    buyTokenAmount,
    sellTokenAmount,
    setLimitOrder,
    formattedLimitPrice,
    setFormattedLimitPrice,
    setBuyTokenAmount,
    setFormattedBuyAmount,
    // setToMarket,
  } = useContext(LimitOrderFormContext)
  // const { t } = useTranslation('swap')
  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  const inputGroupLabel = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteTokenAmount?.currency?.symbol}`

  /**
   * Handle the base currency change.
   */
  const toggleBaseCurrency = () => {
    // Toggle between buy and sell currency
    const kind = limitOrder.kind === LimitOrderKind.SELL ? LimitOrderKind.BUY : LimitOrderKind.SELL
    const [baseTokenAmount, quoteTokenAmount] =
      kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]

    const baseTokenAmountAsFloat = parseFloat(
      formatUnits(baseTokenAmount.raw.toString(), baseTokenAmount.currency.decimals)
    )
    const quoteTokenAmountAsFloat = parseFloat(
      formatUnits(quoteTokenAmount.raw.toString(), quoteTokenAmount.currency.decimals)
    )

    const nextLimitPriceFloat = quoteTokenAmountAsFloat / baseTokenAmountAsFloat
    const nextLimitPriceFormatted = nextLimitPriceFloat.toFixed(6) // 6 is the lowest precision we support due to tokens like USDC
    const nextLimitPriceWei = parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString()

    setLimitOrder({
      ...limitOrder,
      kind,
      limitPrice: nextLimitPriceWei,
    })
    // update the formatted limit price
    setFormattedLimitPrice(nextLimitPriceFormatted)
  }

  /**
   * Handle the limit price input change. Compute the buy amount and update the state.
   */
  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    // Parse the limit price
    const nextLimitPriceFormatted = event.target.value ?? '0' // When the limit price is empty, set the limit price to 0
    const nextLimitPriceFloat = parseFloat(nextLimitPriceFormatted)
    // When price is below or equal to 0, set the limit price to 0, but don't update the state

    debug({
      nextLimitPriceFloat,
    })

    if (nextLimitPriceFloat <= 0 || isNaN(nextLimitPriceFloat)) {
      return setFormattedLimitPrice('0')
    }

    // get and parse the sell token amount
    const sellTokenAmountFloat = parseFloat(
      formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals)
    )

    let newBuyAmountAsFloat = 0 // the amount of buy token

    if (limitOrder.kind === LimitOrderKind.SELL) {
      newBuyAmountAsFloat = sellTokenAmountFloat * nextLimitPriceFloat
    } else {
      newBuyAmountAsFloat = sellTokenAmountFloat / nextLimitPriceFloat
    }

    const nextBuyAmountWei = parseUnits(
      newBuyAmountAsFloat.toFixed(6), // 6 is the lowest precision we support due to tokens like USDC
      buyTokenAmount?.currency?.decimals
    ).toString()

    const nextTokenBuyAmount = new TokenAmount(buyTokenAmount.currency as Token, nextBuyAmountWei)

    setBuyTokenAmount(nextTokenBuyAmount)
    setFormattedLimitPrice(nextLimitPriceFormatted)
    setFormattedBuyAmount(newBuyAmountAsFloat.toString())
    setLimitOrder({
      ...limitOrder,
      limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
      buyAmount: nextBuyAmountWei,
    })
  }

  return (
    <InputGroup>
      <LimitLabel htmlFor={id}>
        <span>{inputGroupLabel}</span>
        {/* Implement with CoW router */}
        {/* <SetToMarket onClick={setToMarket}>{t('limitOrder.setToMarket')}</SetToMarket> */}
      </LimitLabel>
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
