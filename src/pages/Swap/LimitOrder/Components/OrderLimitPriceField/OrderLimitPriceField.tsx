import { formatUnits, parseUnits } from '@ethersproject/units'

import { Dispatch, SetStateAction, useCallback, useContext, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Kind, LimitOrderContext, MarketPrices } from '../../../../../services/LimitOrders'
// import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
// import { InputFocus, Kind, MarketPrices } from '../../interfaces'
import { InputGroup } from '../InputGroup'
import { calculateMarketPriceDiffPercentage } from '../utils'

import { MarketPriceButton } from './MarketPriceButton'
import {
  LimitLabel,
  MarketPriceDiff,
  SetToMarket,
  SwapTokenIconWrapper,
  SwapTokenWrapper,
  ToggleCurrencyButton,
} from './styles'
const invalidChars = ['-', '+', 'e']

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
  // const {
  //   limitOrder,
  //   setLimitOrder,
  //   buyAmount,
  //   setBuyTokenAmount,
  //   sellAmount,
  //   setSellTokenAmount,
  //   formattedLimitPrice,
  //   setFormattedLimitPrice,
  //   setFormattedBuyAmount,
  //   setFormattedSellAmount,
  //   inputFocus,
  // } = useContext(LimitOrderFormContext)

  const protocol = useContext(LimitOrderContext)
  const { sellAmount, buyAmount, kind, limitOrder = {} } = protocol
  // TODO: fix this
  const formattedLimitPrice = 0
  const inputFocus = 'sell'
  const setFormattedLimitPrice = (_t: any) => {}

  const [baseTokenAmount, quoteTokenAmount] = kind === Kind.Sell ? [sellAmount, buyAmount] : [buyAmount, sellAmount]
  const inputGroupLabel = `${kind} ${baseTokenAmount?.currency?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteTokenAmount?.currency?.symbol}`
  const [inputLimitPrice, setInputLimitPrice] = useState<string | number>(formattedLimitPrice)

  const { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
    kind ?? Kind.Sell,
    marketPrices,
    formattedLimitPrice.toString()
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
    const kindSelected = kind === Kind.Sell ? Kind.Buy : Kind.Sell
    if (!sellAmount || !buyAmount) return
    const [baseTokenAmount, quoteTokenAmount] =
      kindSelected === Kind.Sell ? [sellAmount, buyAmount] : [buyAmount, sellAmount]

    const baseTokenAmountAsFloat = parseFloat(
      formatUnits(baseTokenAmount.raw.toString(), baseTokenAmount.currency.decimals)
    )
    const quoteTokenAmountAsFloat = parseFloat(
      formatUnits(quoteTokenAmount.raw.toString(), quoteTokenAmount.currency.decimals)
    )

    const nextLimitPriceFloat = quoteTokenAmountAsFloat / baseTokenAmountAsFloat
    const nextLimitPriceFormatted = nextLimitPriceFloat.toFixed(6) // 6 is the lowest precision we support due to tokens like USDC
    const nextLimitPriceWei = parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString()

    protocol.onLimitOrderChange({
      ...limitOrder,
      kind,
      limitPrice: nextLimitPriceWei,
    })
    // update the formatted limit price
    // setFormattedLimitPrice(nextLimitPriceFormatted)
  }, [limitOrder, sellAmount, buyAmount, protocol])

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

      // const { amount, buyAmountWei, sellAmountWei, newBuyTokenAmount, newSellTokenAmount } = computeNewAmount(
      //   buyAmount,
      //   sellAmount,
      //   nextLimitPriceFloat,
      //   limitOrder.kind,
      //   inputFocus
      // )

      setFormattedLimitPrice(nextLimitPriceFormatted)

      if (inputFocus === Kind.Sell) {
        // setBuyTokenAmount(newBuyTokenAmount)
        // setFormattedBuyAmount(amount.toString())
        // setLimitOrder({
        //   ...limitOrder,
        //   limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
        //   buyAmount: buyAmountWei,
        // })
      } else {
        // setSellTokenAmount(newSellTokenAmount)
        // setFormattedSellAmount(amount.toString())
        // setLimitOrder({
        //   ...limitOrder,
        //   limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
        //   sellAmount: sellAmountWei,
        // })
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
        {fetchMarketPrice && buyAmount?.currency && sellAmount?.currency ? (
          <MarketPriceButton
            buyTokenAmountCurrency={buyAmount.currency}
            sellTokenAmountCurrency={sellAmount.currency}
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
