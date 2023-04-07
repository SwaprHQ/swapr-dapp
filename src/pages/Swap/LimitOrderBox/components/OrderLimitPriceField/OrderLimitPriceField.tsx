import { formatUnits, parseUnits } from '@ethersproject/units'

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { invalidChars } from '../../constants'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { InputFocus, LimitOrderKind, MarketPrices } from '../../interfaces'
import { calculateMarketPriceDiffPercentage, computeNewAmount } from '../../utils'
import { InputGroup } from '../InputGroup'

import { MarketPriceButton } from './MarketPriceButton'
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
  marketPrices: MarketPrices
  fetchMarketPrice: boolean
  setFetchMarketPrice: Dispatch<SetStateAction<boolean>>
}

export function OrderLimitPriceField({
  id,
  marketPrices,
  fetchMarketPrice,
  setFetchMarketPrice,
}: OrderLimitPriceFieldProps) {
  const { t } = useTranslation('swap')
  const {
    limitOrder,
    setLimitOrder,
    buyTokenAmount,
    setBuyTokenAmount,
    sellTokenAmount,
    setSellTokenAmount,
    formattedLimitPrice,
    setFormattedLimitPrice,
    setFormattedBuyAmount,
    setFormattedSellAmount,
    inputFocus,
  } = useContext(LimitOrderFormContext)

  const [baseTokenAmount, quoteTokenAmount] =
    limitOrder.kind === LimitOrderKind.SELL ? [sellTokenAmount, buyTokenAmount] : [buyTokenAmount, sellTokenAmount]
  const inputGroupLabel = `${limitOrder.kind} ${baseTokenAmount?.currency?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteTokenAmount?.currency?.symbol}`
  const [inputLimitPrice, setInputLimitPrice] = useState<string | number>(formattedLimitPrice)

  const { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
    limitOrder.kind,
    marketPrices,
    formattedLimitPrice
  )

  const showPercentage =
    Number(marketPriceDiffPercentage.toFixed(1)) !== 0 && Number(marketPriceDiffPercentage) !== -100

  useEffect(() => {
    setInputLimitPrice(formattedLimitPrice)
  }, [formattedLimitPrice])

  /**
   * Handle the base currency change.
   */
  const toggleBaseCurrency = useCallback(() => {
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

    setLimitOrder(oldLimitOrder => ({
      ...oldLimitOrder,
      kind,
      limitPrice: nextLimitPriceWei,
    }))
    // update the formatted limit price
    setFormattedLimitPrice(nextLimitPriceFormatted)
  }, [buyTokenAmount, limitOrder, sellTokenAmount, setFormattedLimitPrice, setLimitOrder])

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

      const { amount, buyAmountWei, sellAmountWei, newBuyTokenAmount, newSellTokenAmount } = computeNewAmount(
        buyTokenAmount,
        sellTokenAmount,
        nextLimitPriceFloat,
        limitOrder.kind,
        inputFocus
      )

      setFormattedLimitPrice(nextLimitPriceFormatted)

      if (inputFocus === InputFocus.SELL) {
        setBuyTokenAmount(newBuyTokenAmount)
        setFormattedBuyAmount(amount.toString())
        setLimitOrder({
          ...limitOrder,
          limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
          buyAmount: buyAmountWei,
        })
      } else {
        setSellTokenAmount(newSellTokenAmount)
        setFormattedSellAmount(amount.toString())
        setLimitOrder({
          ...limitOrder,
          limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
          sellAmount: sellAmountWei,
        })
      }

      setFetchMarketPrice(false)
    }
  }

  const onClickGetMarketPrice = () => {
    setFetchMarketPrice(true)
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
        {fetchMarketPrice ? (
          <MarketPriceButton
            buyTokenAmountCurrency={buyTokenAmount.currency}
            sellTokenAmountCurrency={sellTokenAmount.currency}
          />
        ) : (
          <SetToMarket onClick={onClickGetMarketPrice}>{t('limitOrder.getMarketPrice')}</SetToMarket>
        )}
      </LimitLabel>
      <InputGroup.InnerWrapper>
        <InputGroup.Input
          id={id}
          type="number"
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
