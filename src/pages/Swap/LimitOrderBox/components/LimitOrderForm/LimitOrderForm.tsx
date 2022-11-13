import { Web3Provider } from '@ethersproject/providers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency, JSBI, Price, Token, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import dayjsUTCPlugin from 'dayjs/plugin/utc'
import { useCallback, useEffect, useRef, useState } from 'react'
import { usePrevious } from 'react-use'

import { ButtonPrimary } from '../../../../../components/Button'
import { AutoColumn } from '../../../../../components/Column'
import { CurrencyInputPanel } from '../../../../../components/CurrencyInputPanel'
import { ApprovalState, useApproveCallback } from '../../../../../hooks/useApproveCallback'
import { useHigherUSDValue } from '../../../../../hooks/useUSDValue'
import { useNotificationPopup } from '../../../../../state/application/hooks'
import { useCurrencyBalances } from '../../../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../../../utils/maxAmountSpend'
import AppBody from '../../../../AppBody'
import { getQuote, getVaultRelayerAddress, signLimitOrder, submitLimitOrder } from '../../api'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { LimitOrderKind, OrderExpiresInUnit, SerializableLimitOrder } from '../../interfaces'
import { getInitialState } from '../../utils'
import { ApprovalFlow } from '../ApprovalFlow'
import { OrderExpiryField } from '../OrderExpiryField'
import { OrderLimitPriceField } from '../OrderLimitPriceField'
import SwapTokens from '../SwapTokens'
import { AutoRow, MaxAlert } from './styles'
import { checkMaxOrderAmount, formatMaxValue } from './utils'

dayjs.extend(dayjsUTCPlugin)

interface HandleCurrencyAmountChangeParams {
  currency: Currency
  amountWei: string
  amountFormatted: string
  updatedLimitOrder?: SerializableLimitOrder
}

export interface LimitOrderFormProps {
  provider: Web3Provider
  chainId: ChainId
  account: string
}

/**
 * The Limit Order Form is the base component for all limit order forms.
 */
export function LimitOrderForm({ account, provider, chainId }: LimitOrderFormProps) {
  const [loading, setLoading] = useState(false)
  const notify = useNotificationPopup()
  // Get the initial values and set the state
  let initialState = useRef(getInitialState(chainId, account)).current
  // Local state
  const [expiresInUnit, setExpiresInUnit] = useState(OrderExpiresInUnit.Minutes)
  // Default expiry time set to 20 minutes
  const [expiresIn, setExpiresIn] = useState(20)

  // IsPossibleToOrder
  const [isPossibleToOrder, setIsPossibleToOrder] = useState({
    status: false,
    value: 0,
  })

  // State holding the sell and buy currency amounts
  const [sellTokenAmount, setSellTokenAmount] = useState<TokenAmount>(initialState.sellTokenAmount)
  const [buyTokenAmount, setBuyTokenAmount] = useState<TokenAmount>(initialState.buyTokenAmount)

  // State holding the limit/order price
  const [price, setPrice] = useState<Price>(initialState.price)

  // Final limit order to be sent to the internal API
  const [limitOrder, setLimitOrder] = useState<SerializableLimitOrder>(initialState.limitOrder)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    initialState = getInitialState(chainId, account)
    setSellTokenAmount(initialState.sellTokenAmount)
    setBuyTokenAmount(initialState.buyTokenAmount)
  }, [chainId])

  const [tokenInApproval, tokenInApprovalCallback] = useApproveCallback(
    sellTokenAmount,
    getVaultRelayerAddress(chainId)
  )

  const setInitialValue = async () => {
    const signer = provider.getSigner()
    const cowQuote = await getQuote({
      chainId,
      signer,
      order: { ...limitOrder, expiresAt: dayjs().add(expiresIn, expiresInUnit).unix() },
    })
    if (cowQuote !== undefined) {
      const {
        quote: { buyAmount, feeAmount },
      } = cowQuote

      const buyTokenFormattedAmount = formatUnits(buyAmount, buyTokenAmount.currency.decimals)

      const updatedLimitOrder = { ...limitOrder, limitPrice: buyAmount, feeAmount }
      setLimitOrder(updatedLimitOrder)
      handleBuyCurrencyAmountChange({
        currency: buyTokenAmount.currency,
        amountWei: buyAmount,
        amountFormatted: buyTokenFormattedAmount,
        updatedLimitOrder,
      })
      setFormattedLimitPrice(buyTokenFormattedAmount)
    }
  }

  useEffect(() => {
    setInitialValue().catch(e => {
      console.error(e)
      setIsPossibleToOrder({
        status: true,
        value: 0,
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount.currency, sellTokenAmount.currency])

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(account, [
    sellTokenAmount.currency,
    buyTokenAmount?.currency,
  ])

  // Fetch the maximum amount of tokens that can be bought or sold
  const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)
  const buyCurrencyMaxAmount = maxAmountSpend(buyCurrencyBalance, chainId, false)

  // Display formatted sell/buy amounts
  const [formattedSellAmount, setFormattedSellAmount] = useState<string>(
    formatUnits(initialState.limitOrder.sellAmount, initialState.sellTokenAmount.currency.decimals)
  )
  const [formattedBuyAmount, setFormattedBuyAmount] = useState<string>('0')
  // Display formatted sell/buy amounts
  const [formattedLimitPrice, setFormattedLimitPrice] = useState<string>('0')

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: sellTokenAmount,
    outputCurrencyAmount: buyTokenAmount,
  })

  const handleSwapTokens = useCallback(() => {
    setSellTokenAmount(buyTokenAmount)
    setBuyTokenAmount(sellTokenAmount)
    setFormattedSellAmount(formattedBuyAmount)
    setFormattedBuyAmount(formattedSellAmount)
    setIsPossibleToOrder({ status: false, value: 0 })
    if (buyTokenAmount.currency.address && sellTokenAmount.currency.address) {
      setLimitOrder(limitOrder => ({
        ...limitOrder,
        sellAmount: buyTokenAmount.raw.toString(),
        buyAmount: sellTokenAmount.raw.toString(),
        sellToken: buyTokenAmount.currency.address!,
        buyToken: sellTokenAmount.currency.address!,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount, sellTokenAmount])

  // Determine if the token has to be approved first
  const showApproveFlow = tokenInApproval === ApprovalState.NOT_APPROVED || tokenInApproval === ApprovalState.PENDING

  // Form submission handler
  const reviewOrder = async () => {
    setLoading(true)

    // sign the order
    try {
      const signer = provider.getSigner()
      const finalizedLimitOrder = {
        ...limitOrder,
        expiresAt: dayjs().add(expiresIn, expiresInUnit).unix(),
      }
      const {
        quote: { feeAmount },
        id,
      } = await getQuote({
        chainId,
        signer,
        order: finalizedLimitOrder,
      })

      const signedOrder = await signLimitOrder({
        order: { ...finalizedLimitOrder, feeAmount, quoteId: id },
        chainId,
        signer,
      })

      // send the order to the API
      const response = await submitLimitOrder({
        order: signedOrder,
        chainId,
        signer,
      })
      if (response) {
        notify('Successfully created limit order')
      } else {
        notify('Failed to place limit order. Try again.', false)
      }
    } catch (error) {
      console.log(error)
      notify('Failed to place limit order. Try again.', false)
    } finally {
      setLoading(false)
    }
  }

  const previousSellAmount = usePrevious(sellCurrencyBalance)
  const newSellAmount = previousSellAmount?.raw.toString() !== sellCurrencyBalance?.raw.toString()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const amountWei = parseUnits(formattedSellAmount, sellTokenAmount?.currency?.decimals).toString()
      const expiresAt = dayjs().add(expiresIn, expiresInUnit).unix()
      const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)

      checkMaxOrderAmount(
        limitOrder,
        setIsPossibleToOrder,
        setLimitOrder,
        amountWei,
        expiresAt,
        sellTokenAmount,
        sellCurrencyMaxAmount,
        chainId,
        provider
      )
    }, 500)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formattedSellAmount, formattedBuyAmount, newSellAmount])

  /**
   * Aggregate the sell currency amount state variables into a single value
   */
  const handleSellCurrencyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrencyAmountChangeParams) => {
    const limitPriceFloat = parseFloat(formattedLimitPrice)

    // Construct a new token amount and format it
    const newLimitOrder = {
      ...updatedLimitOrder,
      sellAmount: amountWei,
      sellToken: currency.address as string,
    }
    // Update the buy currency amount if the user has selected a token
    // Update relevant state variables
    const nextSellTokenAmount = new TokenAmount(currency as Token, amountWei)
    const nextSellAmountFloat = parseFloat(amountFormatted)

    setFormattedSellAmount(amountFormatted) // update the token amount input

    let nextBuyAmountFloat = 0
    // Compute the buy amount based on the new sell amount

    if (limitOrder.kind === LimitOrderKind.SELL) {
      nextBuyAmountFloat = nextSellAmountFloat * limitPriceFloat
    } else {
      nextBuyAmountFloat = nextSellAmountFloat / limitPriceFloat
    }
    if ((Number(amountWei) ?? 0) === 0) {
      setIsPossibleToOrder({ value: 0, status: true })
    }

    // Format the buy amount
    // Update buy amount state variables
    setBuyTokenAmount(
      new TokenAmount(
        buyTokenAmount.currency as Token,
        parseUnits(nextBuyAmountFloat.toFixed(6), buyTokenAmount.currency.decimals).toString()
      )
    )
    setFormattedBuyAmount(nextBuyAmountFloat.toString()) // update the token amount input
    setSellTokenAmount(nextSellTokenAmount)
    // Re-compute the limit order boy
    setLimitOrder(newLimitOrder)
  }

  /**
   * Aggregate the buy currency amount state variables into a single value
   */
  const handleBuyCurrencyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrencyAmountChangeParams) => {
    // Construct a new token amount and format it

    const newLimitOrder = {
      ...updatedLimitOrder,
      buyAmount: amountWei,
      buyToken: currency.address as string,
    }
    const nextBuyAmountFormatted = amountFormatted // When the limit price is empty, set the limit price to 0
    const nextBuyAmountFloat = parseFloat(amountFormatted)

    // Update the buy currency amount if the user has selected a token
    // to prevent `TokenAmount` constructor from throwing an error
    newLimitOrder.buyToken = currency.address as string
    // Update relevant state variables
    const newBuyTokenAmount = new TokenAmount(currency as Token, amountWei)
    setBuyTokenAmount(newBuyTokenAmount)

    // get and parse the sell token amount
    const sellTokenAmountFloat = parseFloat(
      formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals)
    )

    let nextLimitPriceFloat = 0

    if (limitOrder.kind === LimitOrderKind.SELL) {
      nextLimitPriceFloat = nextBuyAmountFloat / sellTokenAmountFloat
      // multiply the sell amount by the new price
      newLimitOrder.limitPrice = parseUnits(
        nextLimitPriceFloat !== Infinity ? nextLimitPriceFloat.toFixed(6) : '0',
        currency.decimals
      ).toString()
    } else {
      nextLimitPriceFloat = sellTokenAmountFloat / nextBuyAmountFloat
      // divide the buy amount by the new price
      newLimitOrder.limitPrice = JSBI.multiply(newBuyTokenAmount.raw, buyTokenAmount.raw).toString()
    }

    // Update state
    setFormattedBuyAmount(nextBuyAmountFormatted) // update the token amount input
    setFormattedLimitPrice(nextLimitPriceFloat.toString()) // update the token amount input
    setLimitOrder(newLimitOrder)
  }

  const handleInputOnChange = async (formattedValue: string) => {
    const amountFormatted = formattedValue.trim() === '' ? '0' : formattedValue
    const amountWei = parseUnits(formattedValue, sellTokenAmount?.currency?.decimals).toString()
    handleSellCurrencyAmountChange({
      currency: sellTokenAmount?.currency as Token,
      amountWei,
      amountFormatted,
    })
  }

  // In the event that user choose native token as sell currency, offer to wrap it

  return (
    <AppBody>
      <LimitOrderFormContext.Provider
        value={{
          limitOrder,
          setLimitOrder,
          price,
          setPrice,
          buyTokenAmount,
          setBuyTokenAmount,
          sellTokenAmount,
          setSellTokenAmount,
          formattedLimitPrice,
          setFormattedLimitPrice,
          formattedBuyAmount,
          setFormattedBuyAmount,
          expiresIn,
          setExpiresIn,
          expiresInUnit,
          setExpiresInUnit,
          setToMarket: () => {},
        }}
      >
        <AutoColumn gap="12px">
          <AutoColumn gap="3px">
            <CurrencyInputPanel
              id="limit-order-box-sell-currency"
              currency={sellTokenAmount.currency}
              onCurrencySelect={currency => {
                const prevSellTokenAmount = sellTokenAmount
                const amountWei = prevSellTokenAmount?.raw
                  ? prevSellTokenAmount.raw.toString()
                  : formattedSellAmount
                  ? parseUnits(formattedSellAmount, prevSellTokenAmount?.currency?.decimals).toString()
                  : '0' // use 0 if no buy currency amount is set
                handleSellCurrencyAmountChange({ currency, amountWei, amountFormatted: formattedSellAmount })
              }}
              value={formattedSellAmount}
              onUserInput={handleInputOnChange}
              onMax={() => {
                if (!sellCurrencyMaxAmount) return
                handleSellCurrencyAmountChange({
                  currency: sellCurrencyMaxAmount?.currency as Token,
                  amountWei: sellCurrencyMaxAmount?.raw.toString(),
                  amountFormatted: sellCurrencyMaxAmount.toSignificant(),
                })
              }}
              maxAmount={sellCurrencyMaxAmount}
              fiatValue={fiatValueInput}
              isFallbackFiatValue={isFallbackFiatValueInput}
              showNativeCurrency={false}
            />
            <SwapTokens swapTokens={handleSwapTokens} loading={loading} />
            <CurrencyInputPanel
              id="limit-order-box-buy-currency"
              currency={buyTokenAmount?.currency}
              onCurrencySelect={currency => {
                const prevBuyTokenAmount = buyTokenAmount
                const amountWei = prevBuyTokenAmount?.raw
                  ? prevBuyTokenAmount.raw.toString()
                  : formattedBuyAmount
                  ? parseUnits(formattedBuyAmount, prevBuyTokenAmount?.currency?.decimals).toString()
                  : '0' // use 0 if no buy currency amount is set
                handleBuyCurrencyAmountChange({ currency, amountWei, amountFormatted: formattedBuyAmount })
              }}
              value={formattedBuyAmount}
              onUserInput={formattedValue => {
                const amountFormatted = formattedValue.trim() === '' ? '0' : formattedValue
                const amountWei = parseUnits(formattedValue, buyTokenAmount.currency.decimals).toString()
                handleBuyCurrencyAmountChange({
                  currency: buyTokenAmount.currency,
                  amountWei,
                  amountFormatted,
                })
              }}
              maxAmount={buyCurrencyMaxAmount}
              fiatValue={fiatValueOutput}
              isFallbackFiatValue={isFallbackFiatValueOutput}
              showNativeCurrency={false}
            />
          </AutoColumn>
          <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
            <OrderLimitPriceField id="limitPrice" />
            <OrderExpiryField id="limitOrderExpiry" />
          </AutoRow>
          {showApproveFlow ? (
            <ApprovalFlow
              tokenInSymbol={sellTokenAmount.currency.symbol as string}
              approval={tokenInApproval}
              approveCallback={tokenInApprovalCallback}
            />
          ) : (
            <>
              {isPossibleToOrder.status && isPossibleToOrder.value > 0 && (
                <MaxAlert>
                  Max possible amount with fees for {sellTokenAmount.currency.symbol} is{' '}
                  {formatMaxValue(isPossibleToOrder.value)}
                </MaxAlert>
              )}
              <ButtonPrimary onClick={reviewOrder} disabled={isPossibleToOrder.status}>
                Review Order
              </ButtonPrimary>
            </>
          )}
        </AutoColumn>
      </LimitOrderFormContext.Provider>
    </AppBody>
  )
}
