import { formatUnits, parseUnits } from '@ethersproject/units'
import { Currency, TokenAmount } from '@swapr/sdk'

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Kind, LimitOrderBase, MarketPrices } from '../../../../../services/LimitOrders'
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

const getBaseQuoteTokens = ({
  sellAmount,
  buyAmount,
  kind,
  sellToken,
  buyToken,
}: {
  sellAmount: TokenAmount
  buyAmount: TokenAmount
  kind: Kind
  sellToken: Currency
  buyToken: Currency
}) => {
  return kind === Kind.Sell
    ? { baseTokenAmount: sellAmount, baseToken: sellToken, quoteTokenAmount: buyAmount, quoteToken: buyToken }
    : { baseTokenAmount: buyAmount, baseToken: buyToken, quoteTokenAmount: sellAmount, quoteToken: sellToken }
}

export interface OrderLimitPriceFieldProps {
  marketPrices: MarketPrices
  fetchMarketPrice: boolean
  setFetchMarketPrice: Dispatch<SetStateAction<boolean>>
  protocol: LimitOrderBase
  sellAmount: TokenAmount
  buyAmount: TokenAmount
  kind: Kind
  limitOrder?: any
  sellToken: Currency
  buyToken: Currency
}

export function OrderLimitPriceField({
  marketPrices,
  fetchMarketPrice,
  setFetchMarketPrice,
  protocol,
  sellAmount,
  buyAmount,
  kind,
  limitOrder = {},
  sellToken,
  buyToken,
}: OrderLimitPriceFieldProps) {
  const { t } = useTranslation('swap')

  // const formattedLimitPrice = 0
  // // const inputFocus = 'sell'
  // const setFormattedLimitPrice = (_t: any) => {}

  const [formattedLimitPrice, setFormattedLimitPrice] = useState<string | number>(0)

  const [{ baseToken, baseTokenAmount: _b, quoteToken, quoteTokenAmount: _q }, setBaseQuoteTokens] = useState(
    getBaseQuoteTokens({ sellAmount, buyAmount, kind, sellToken, buyToken })
  )

  useEffect(() => {
    setBaseQuoteTokens(getBaseQuoteTokens({ sellAmount, buyAmount, kind, sellToken, buyToken }))
  }, [sellToken, buyToken, sellAmount, buyAmount, kind])

  const inputGroupLabel = `${kind} ${baseToken?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteToken?.symbol}`

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
    setFormattedLimitPrice(nextLimitPriceFormatted)
  }, [kind, sellAmount, buyAmount, protocol, limitOrder])

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

      if (kind === Kind.Sell) {
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
      <LimitLabel htmlFor="limitPrice">
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
          id="limitPrice"
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