import { parseUnits } from '@ethersproject/units'
import { Currency, TokenAmount } from '@swapr/sdk'

import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'

import { Kind, LimitOrderBase, MarketPrices } from '../../../../../services/LimitOrders'
import { InputGroup } from '../InputGroup'
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { MarketPriceButton } from './MarketPriceButton'
import {
  LimitLabel,
  MarketPriceDiff,
  SetToMarket,
  SwapTokenIconWrapper,
  SwapTokenWrapper,
  ToggleCurrencyButton,
} from './styles'
import { computeNewAmount } from './utils'

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
  setSellAmount(t: TokenAmount): void
  setBuyAmount(t: TokenAmount): void
  setKind(t: Kind): void
}

export function OrderLimitPriceField({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  marketPrices,
  fetchMarketPrice,
  setFetchMarketPrice,
  protocol,
  sellAmount,
  buyAmount,
  kind,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  limitOrder = {},
  sellToken,
  buyToken,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSellAmount,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setBuyAmount,
  setKind,
}: OrderLimitPriceFieldProps) {
  const { t } = useTranslation('swap')

  const [{ baseToken, quoteToken }, setBaseQuoteTokens] = useState(
    getBaseQuoteTokens({ sellAmount, buyAmount, kind, sellToken, buyToken })
  )

  useEffect(() => {
    setBaseQuoteTokens(getBaseQuoteTokens({ sellAmount, buyAmount, kind, sellToken, buyToken }))
  }, [sellToken, buyToken, sellAmount, buyAmount, kind])

  const inputGroupLabel = `${kind} 1 ${baseToken?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteToken?.symbol}`

  const [formattedLimitPrice, setFormattedLimitPrice] = useState<string | number>(protocol.getTokenLimitPrices())
  const [inputLimitPrice, setInputLimitPrice] = useState<string | number>(formattedLimitPrice)
  const [inputFocus, setInputFocus] = useState(false)

  // const { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
  //   kind ?? Kind.Sell,
  //   marketPrices,
  //   formattedLimitPrice.toString()
  // )

  // const showPercentage =
  //   Number(marketPriceDiffPercentage.toFixed(1)) !== 0 && Number(marketPriceDiffPercentage) !== -100

  // useEffect(() => {
  //   setInputLimitPrice(formattedLimitPrice)
  // }, [formattedLimitPrice])
  const limitPrice = protocol.getTokenLimitPrices()
  useEffect(() => {
    setFormattedLimitPrice(limitPrice)
    if (!inputFocus) {
      setInputLimitPrice(limitPrice)
    }
  }, [inputFocus, limitPrice])

  /**
   * Handle the limit price input change. Compute the buy amount and update the state.
   */
  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    setInputFocus(true)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [baseTokenAmount, quoteTokenAmount] = kind === Kind.Sell ? [sellAmount, buyAmount] : [buyAmount, sellAmount]
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

      // const
      //     // When price is below or equal to 0, set the limit price to 0, but don't update the state

      const { buyAmountWei, sellAmountWei, newBuyTokenAmount, newSellTokenAmount } = computeNewAmount(
        buyAmount,
        sellAmount,
        nextLimitPriceFloat,
        limitOrder.kind
        // inputFocus
      )

      //     setFormattedLimitPrice(nextLimitPriceFormatted)

      if (kind === Kind.Sell) {
        setBuyAmount(newBuyTokenAmount)
        // setFormattedBuyAmount(amount.toString())
        protocol.onLimitOrderChange({
          ...limitOrder,
          limitPrice: parseUnits(nextLimitPriceFormatted, quoteTokenAmount?.currency?.decimals).toString(),
          buyAmount: buyAmountWei,
        })
      } else {
        setSellAmount(newSellTokenAmount)
        // setFormattedSellAmount(amount.toString())
        protocol.onLimitOrderChange({
          ...limitOrder,
          limitPrice: parseUnits(nextLimitPriceFormatted, baseTokenAmount?.currency?.decimals).toString(),
          sellAmount: sellAmountWei,
        })
      }
    }
  }

  const onClickGetMarketPrice = () => {
    setInputFocus(false)
    setFetchMarketPrice(true)
  }

  // const onChangeHandler = () => {}

  // TODO: fix it
  const showPercentage = false
  const marketPriceDiffPercentage = 0
  const isDiffPositive = false

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
          <MarketPriceButton key={`${buyToken.symbol}-${sellToken.symbol}`} />
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
          <ToggleCurrencyButton onClick={() => setKind(kind === Kind.Sell ? Kind.Buy : Kind.Sell)}>
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
