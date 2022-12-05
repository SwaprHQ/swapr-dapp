import { formatUnits, parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@swapr/sdk'

import { useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { invalidChars } from '../../constants'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { LimitOrderKind } from '../../interfaces'
import { InputGroup } from '../InputGroup'
import {
  LimitLabel,
  MarketPriceDiff,
  SetToMarket,
  SwapTokenIconWrapper,
  SwapTokenWrapper,
  ToggleCurrencyButton,
} from './styles'

export interface OrderLimitPriceFieldProps {
  id?: string
}

export function OrderLimitPriceField({ id }: OrderLimitPriceFieldProps) {
  const { t } = useTranslation('swap')
  const {
    limitOrder,
    buyTokenAmount,
    sellTokenAmount,
    setLimitOrder,
    formattedLimitPrice,
    setFormattedLimitPrice,
    setBuyTokenAmount,
    setFormattedBuyAmount,
    setToMarket,
    marketPrices,
  } = useContext(LimitOrderFormContext)

  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  const inputGroupLabel = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteTokenAmount?.currency?.symbol}`
  const [inputLimitPrice, setInputLimitPrice] = useState<string | number>(formattedLimitPrice)

  const nextLimitPriceFloat = limitOrder.kind === LimitOrderKind.SELL ? marketPrices.buy : marketPrices.sell

  let marketPriceDiffPercentage = 0
  let isDiffPositive = false

  if (Boolean(Number(nextLimitPriceFloat)))
    if (limitOrder.kind === LimitOrderKind.SELL) {
      marketPriceDiffPercentage = (Number(formattedLimitPrice) / Number(nextLimitPriceFloat.toFixed(6)) - 1) * 100
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) > 0
    } else {
      marketPriceDiffPercentage = (Number(nextLimitPriceFloat.toFixed(6)) / Number(formattedLimitPrice) - 1) * 100

      if (marketPriceDiffPercentage < 0) {
        marketPriceDiffPercentage = Math.abs(marketPriceDiffPercentage)
      } else {
        marketPriceDiffPercentage = marketPriceDiffPercentage * -1
      }
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) < 0
    }

  marketPriceDiffPercentage = Math.min(marketPriceDiffPercentage, 999)

  const showPercentage =
    Number(marketPriceDiffPercentage.toFixed(1)) !== 0 && Number(marketPriceDiffPercentage) !== -100

  useEffect(() => {
    setInputLimitPrice(formattedLimitPrice)
  }, [formattedLimitPrice])

  /**
   * Handle the base currency change.
   */
  const toggleBaseCurrency = () => {
    // Toggle between buy and sell currency
    const kind = limitOrder.kind === LimitOrderKind.SELL ? LimitOrderKind.BUY : LimitOrderKind.SELL

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
    const nextLimitPriceFormatted = event.target.value // When the limit price is empty, set the limit price to 0
    if (nextLimitPriceFormatted.split('.').length > 2) {
      event.preventDefault()
      return
    }
    if (nextLimitPriceFormatted === '' || nextLimitPriceFormatted === '0.') {
      setInputLimitPrice(nextLimitPriceFormatted)
    } else if (nextLimitPriceFormatted === '.') {
      setInputLimitPrice('0.')
      return setFormattedLimitPrice('0')
    } else {
      const nextLimitPriceFloat = parseFloat(nextLimitPriceFormatted ?? 0)
      if (nextLimitPriceFloat < 0 || isNaN(nextLimitPriceFloat)) {
        setInputLimitPrice(0)
        return setFormattedLimitPrice('0')
      }
      setInputLimitPrice(nextLimitPriceFormatted)
      // When price is below or equal to 0, set the limit price to 0, but don't update the state

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
  }

  return (
    <InputGroup>
      <LimitLabel htmlFor={id}>
        <span>
          {inputGroupLabel}
          {showPercentage && (
            <MarketPriceDiff isPositive={isDiffPositive}> ({marketPriceDiffPercentage.toFixed(2)}%)</MarketPriceDiff>
          )}
        </span>
        <SetToMarket onClick={setToMarket}>{t('limitOrder.setToMarket')}</SetToMarket>
      </LimitLabel>
      <InputGroup.InnerWrapper>
        <InputGroup.Input
          id={id}
          onKeyDown={e => {
            if (invalidChars.includes(e.key)) {
              e.preventDefault()
            }
          }}
          onBlur={e => {
            if (e.target.value.trim() === '' || e.target.value === '0' || e.target.value === '0.') {
              setInputLimitPrice(formattedLimitPrice)
              setFormattedLimitPrice(formattedLimitPrice)
            }
          }}
          value={inputLimitPrice}
          onChange={onChangeHandler}
        />
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
