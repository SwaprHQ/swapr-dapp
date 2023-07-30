import { Currency, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { Flex } from 'rebass'

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
  LimitLabelGroup,
} from './styles'

const invalidChars = ['-', '+', 'e']

const getBaseQuoteTokens = ({ kind, sellToken, buyToken }: { kind: Kind; sellToken: Currency; buyToken: Currency }) => {
  return kind === Kind.Sell
    ? { baseToken: sellToken, quoteToken: buyToken }
    : { baseToken: buyToken, quoteToken: sellToken }
}

interface OrderLimitPriceFieldProps {
  protocol: LimitOrderBase
  sellAmount: TokenAmount
  buyAmount: TokenAmount
  kind: Kind
  marketPrices: MarketPrices
  sellToken: Currency
  buyToken: Currency
  setSellAmount(t: TokenAmount): void
  setBuyAmount(t: TokenAmount): void
  setKind(t: Kind): void
  setLoading(t: boolean): void
  handleGetMarketPrice(): Promise<string>
}

export function OrderLimitPriceField({
  protocol,
  sellAmount,
  buyAmount,
  kind,
  marketPrices,
  sellToken,
  buyToken,
  setSellAmount,
  setBuyAmount,
  setKind,
  setLoading,
  handleGetMarketPrice,
}: OrderLimitPriceFieldProps) {
  const { t } = useTranslation('swap')

  const quoteRef = useRef<NodeJS.Timer>()

  const { baseToken, quoteToken } = getBaseQuoteTokens({ kind, sellToken, buyToken })

  const inputGroupLabel = `${kind} 1 ${baseToken?.symbol} at`
  const toggleCurrencyButtonLabel = `${quoteToken?.symbol}`

  useEffect(() => {
    const limitPrice = protocol.getLimitPrice()
    setInputLimitPrice(Number(limitPrice).toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.limitPrice])

  useEffect(() => {
    quoteRef.current = setInterval(async () => {
      setLoading(true)
      try {
        if (!protocol.userUpdatedLimitPrice) {
          await protocol.getQuote()
        }
      } finally {
        setLoading(false)
      }
    }, 15000)

    if (protocol.userUpdatedLimitPrice) {
      setLoading(false)
      clearInterval(quoteRef.current)
    }

    return () => {
      clearInterval(quoteRef.current)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.userUpdatedLimitPrice])

  const [inputLimitPrice, setInputLimitPrice] = useState(protocol.limitPrice)

  const { marketPriceDiffPercentage, isDiffPositive } = calculateMarketPriceDiffPercentage(
    kind ?? Kind.Sell,
    marketPrices,
    protocol.limitPrice
  )

  const showPercentage =
    Number(marketPriceDiffPercentage.toFixed(1)) !== 0 && Number(marketPriceDiffPercentage) !== -100

  /**
   * Handle the limit price input change. Compute the buy amount and update the state.
   */
  const onChangeHandler: React.ChangeEventHandler<HTMLInputElement> = event => {
    const nextLimitPriceFormatted = event.target.value // When the limit price is empty, set the limit price to 0
    if (nextLimitPriceFormatted.split('.').length > 2) {
      event.preventDefault()
      return
    }
    if (nextLimitPriceFormatted === '' || nextLimitPriceFormatted === '0.') {
      setInputLimitPrice(nextLimitPriceFormatted)
    } else if (nextLimitPriceFormatted === '.') {
      setInputLimitPrice('0.')
      protocol.onLimitPriceChange('0')
      return
    } else {
      const nextLimitPriceFloat = parseFloat(nextLimitPriceFormatted ?? 0)
      if (nextLimitPriceFloat < 0 || isNaN(nextLimitPriceFloat)) {
        setInputLimitPrice('0')
        protocol.onLimitPriceChange('0')
        return
      }

      setInputLimitPrice(nextLimitPriceFormatted)

      protocol.onLimitPriceChange(nextLimitPriceFormatted)
      protocol.onUserUpadtedLimitPrice(true)

      if (protocol.kind === Kind.Sell) {
        protocol.quoteBuyAmount = new TokenAmount(
          protocol.buyToken,
          parseUnits(nextLimitPriceFormatted, protocol.buyToken.decimals).toString()
        )
        protocol.quoteSellAmount = new TokenAmount(
          protocol.sellToken,
          parseUnits('1', protocol.sellToken.decimals).toString()
        )
      } else {
        protocol.quoteBuyAmount = new TokenAmount(
          protocol.buyToken,
          parseUnits('1', protocol.buyToken.decimals).toString()
        )
        protocol.quoteSellAmount = new TokenAmount(
          protocol.sellToken,
          parseUnits(nextLimitPriceFormatted, protocol.sellToken.decimals).toString()
        )
      }
      const limitPrice = protocol.getLimitPrice()
      protocol.onLimitPriceChange(limitPrice)

      if (kind === Kind.Sell) {
        const buyAmount = parseFloat(protocol.sellAmount.toExact()) * parseFloat(limitPrice)

        const newBuyTokenAmount = new TokenAmount(
          protocol.buyToken,
          parseUnits(buyAmount.toFixed(6), protocol.buyToken.decimals).toString()
        )
        setBuyAmount(newBuyTokenAmount)
        protocol.onBuyAmountChange(newBuyTokenAmount)
      } else {
        const sellAmount = parseFloat(protocol.buyAmount.toExact()) * parseFloat(limitPrice)

        const newSellTokenAmount = new TokenAmount(
          protocol.sellToken,
          parseUnits(sellAmount.toFixed(6), protocol.sellToken.decimals).toString()
        )

        setSellAmount(newSellTokenAmount)
        protocol.onSellAmountChange(newSellTokenAmount)
      }
    }
  }

  const onClickGetMarketPrice = async () => {
    // protocol.loading = true
    // setLoading(true)

    // protocol.onUserUpadtedLimitPrice(false)
    // await protocol.getQuote()
    // protocol.loading = false
    // setLoading(false)
    // if (kind === Kind.Sell) {
    //   setBuyAmount(protocol.buyAmount)
    // } else {
    //   setSellAmount(protocol.sellAmount)
    // }
    // const limitPrice = protocol.getLimitPrice()
    // protocol.onLimitPriceChange(limitPrice)
    const limitPrice = await handleGetMarketPrice()
    setInputLimitPrice(limitPrice)
  }

  return (
    <InputGroup>
      <LimitLabel htmlFor="limitPrice">
        <LimitLabelGroup>
          <Flex flex={58}>
            <p>
              {inputGroupLabel}
              {showPercentage && (
                <MarketPriceDiff isPositive={isDiffPositive}>({marketPriceDiffPercentage.toFixed(2)}%)</MarketPriceDiff>
              )}
            </p>
          </Flex>
          <Flex flex={42} flexDirection="row-reverse">
            {!protocol.userUpdatedLimitPrice && buyAmount?.currency && sellAmount?.currency ? (
              <MarketPriceButton key={`${buyToken.symbol}-${sellToken.symbol}-${protocol.limitPrice}`} />
            ) : (
              <SetToMarket onClick={onClickGetMarketPrice}>{t('limitOrder.getMarketPrice')}</SetToMarket>
            )}
          </Flex>
        </LimitLabelGroup>
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
              setInputLimitPrice(protocol.limitPrice)
            }
          }}
          value={inputLimitPrice}
          onChange={onChangeHandler}
        />
        <InputGroup.ButtonAddonsWrapper>
          <ToggleCurrencyButton
            onClick={() => {
              const newKind = kind === Kind.Sell ? Kind.Buy : Kind.Sell
              setKind(newKind)
              protocol.onKindChange(newKind)

              const limitPrice = protocol.getLimitPrice()
              setInputLimitPrice(limitPrice)
            }}
          >
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
