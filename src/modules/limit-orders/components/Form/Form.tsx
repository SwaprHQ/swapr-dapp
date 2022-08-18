import { Web3Provider } from '@ethersproject/providers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency, JSBI, Price, Token, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import dayjsUTCPlugin from 'dayjs/plugin/utc'
import { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../../../assets/svg/swap-icon.svg'
import { ButtonPrimary } from '../../../../components/Button'
import { AutoColumn } from '../../../../components/Column'
import { CurrencyInputPanel } from '../../../../components/CurrencyInputPanel'
import { AutoRow as AutoRowBase } from '../../../../components/Row'
import { ArrowWrapper, SwitchIconContainer, SwitchTokensAmountsContainer } from '../../../../components/swap/styleds'
import { useHigherUSDValue } from '../../../../hooks/useUSDValue'
import AppBody from '../../../../pages/AppBody'
import { useCurrencyBalances } from '../../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../../utils/maxAmountSpend'
import { signLimitOrder, submitLimitOrder } from '../../api'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { LimitOrderKind, OrderExpiresInUnit, SerializableLimitOrder } from '../../interfaces'
import { getInitialState } from '../../utils'
import { OrderExpirayField } from '../partials/OrderExpirayField'
import { OrderLimitPriceField } from '../partials/OrderLimitPriceField'

dayjs.extend(dayjsUTCPlugin)

const AutoRow = styled(AutoRowBase)`
  gap: 12px;
  justify-items: space-between;
  flex-wrap: nowrap;

  > div {
    width: 50%;
  }
`

export interface LimitOrderFormProps {
  provider: Web3Provider
  chainId: ChainId
  account: string
}

/**
 * The Limit Order Form is the base component for all limit order forms.
 */
export function Form({ account, provider, chainId }: LimitOrderFormProps) {
  const [loading, setLoading] = useState(false)

  // Get the initial values and set the state
  const initialState = getInitialState(chainId, account)

  // Local state
  const [expiresInUnit, setExpiresInUnit] = useState(OrderExpiresInUnit.Minutes)
  const [expiresIn, setExpiresIn] = useState(20)

  // State holding the sell and buy currency amounts
  const [sellTokenAmount, setSellTokenAmount] = useState<TokenAmount>(initialState.sellTokenAmount)
  const [buyTokenAmount, setBuyTokenAmount] = useState<TokenAmount>(initialState.buyTokenAmount)

  // State holding the limit/order price
  const [price, setPrice] = useState<Price>(initialState.price)

  // Final limit order to be sent to the internal API
  const [limitOrder, setLimitOrder] = useState<SerializableLimitOrder>(initialState.limitOrder)

  // Handles chainId change to update initial sell and buy currency amounts
  useEffect(() => {
    // Get the initial values and set the state
    const initialState = getInitialState(chainId, account)
    setSellTokenAmount(initialState.sellTokenAmount)
    setBuyTokenAmount(initialState.buyTokenAmount)
    setPrice(initialState.price)
    setLimitOrder(initialState.limitOrder)
  }, [chainId, account])

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(account, [
    sellTokenAmount.currency,
    buyTokenAmount?.currency,
  ])

  // Fetch the maximum amount of tokens that can be bought or sold
  const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)
  const buyCurrencyMaxAmount = maxAmountSpend(buyCurrencyBalance, chainId, false)

  // Display formatted sell/buy amounts
  const [formattedSellAmount, setFormattedSellAmount] = useState<string>('0')
  const [formattedBuyAmount, setFormattedBuyAmount] = useState<string>('0')
  // Display formatted sell/buy amounts
  const [formattedLimitPrice, setFormattedLimitPrice] = useState<string>('0')

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: sellTokenAmount,
    outputCurrencyAmount: buyTokenAmount,
  })

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

      const signedOrder = await signLimitOrder({
        order: finalizedLimitOrder,
        chainId,
        signer,
      })
      console.log({ signedOrder })
      // send the order to the API

      const response = await submitLimitOrder({
        order: signedOrder,
        chainId,
        signer,
      })

      console.log(response)
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  interface HandleCurrenyAmountChangeParams {
    currency: Currency
    amountWei: string
    amountFormatted: string
  }

  /**
   * Aggregate the sell currency amount state variables into a single value
   */
  const handleSellCurrenyAmountChange = ({ amountWei, currency, amountFormatted }: HandleCurrenyAmountChangeParams) => {
    unstable_batchedUpdates(() => {
      // Construct a new token amount and format it
      const newLimitOrder = {
        ...limitOrder,
        sellAmount: amountWei,
      }
      setFormattedSellAmount(amountFormatted) // update the token amount input
      // Update the buy currency amount if the user has selected a token
      newLimitOrder.sellToken = currency.address as string
      // Update relevant state variables
      const newSellTokenAmount = new TokenAmount(currency as Token, amountWei)
      setSellTokenAmount(newSellTokenAmount)

      console.log(limitOrder.limitPrice + ' * ' + amountFormatted)

      ////////////////////////////////
      // Compute the buy amount based on the new sell amount
      const newBuyAmountFormattedNumber =
        parseFloat(amountFormatted) * parseFloat(formatUnits(limitOrder.limitPrice, buyTokenAmount.currency.decimals))
      const newBuyTokenAmountBN = parseUnits(newBuyAmountFormattedNumber.toString(), buyTokenAmount.currency.decimals)
      // Format the buy amount
      // Update buy amount state variables
      setBuyTokenAmount(new TokenAmount(buyTokenAmount.currency as Token, newBuyTokenAmountBN.toString()))
      setFormattedBuyAmount(newBuyAmountFormattedNumber.toString()) // update the token amount input
      ////////////////////////////////

      // Re-compute the limit order boy
      setLimitOrder(newLimitOrder)
    })
  }

  /**
   * Aggregate the buy currency amount state variables into a single value
   */
  const handleBuyCurrenyAmountChange = ({ amountWei, currency, amountFormatted }: HandleCurrenyAmountChangeParams) => {
    unstable_batchedUpdates(() => {
      // Construct a new token amount and format it
      const newLimitOrder = {
        ...limitOrder,
        buyAmount: amountWei,
      }

      console.log({ amountWei, currency, amountFormatted })

      setFormattedBuyAmount(amountFormatted) // update the token amount input

      // Update the buy currency amount if the user has selected a token
      // to prevent `TokenAmount` constructor from throwing an error
      newLimitOrder.buyToken = currency.address as string
      // Update relevant state variables
      const newBuyTokenAmount = new TokenAmount(currency as Token, amountWei)
      setBuyTokenAmount(newBuyTokenAmount)

      if (limitOrder.kind === LimitOrderKind.SELL) {
        const sellTokenAmountFormatted = parseFloat(
          formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals)
        )
        const buyTokenAmountFormatted = parseFloat(amountFormatted)
        const newLimitPriceFormatted = buyTokenAmountFormatted / sellTokenAmountFormatted

        console.log({ sellTokenAmountFormatted, buyTokenAmountFormatted, newLimitPriceFormatted })

        console.log({ newLimitPriceFormatted })
        // multiply the sell amount by the new price
        newLimitOrder.limitPrice = parseUnits(
          newLimitPriceFormatted !== Infinity ? newLimitPriceFormatted.toFixed(4) : '0',
          currency.decimals
        ).toString()
      } else {
        // divide the buy amount by the new price
        newLimitOrder.limitPrice = JSBI.multiply(newBuyTokenAmount.raw, buyTokenAmount.raw).toString()
      }

      console.log('newLimitOrder.limitPrice: ', newLimitOrder.limitPrice)
      // update the price input
      setFormattedLimitPrice(formatUnits(newLimitOrder.limitPrice, newBuyTokenAmount.currency.decimals))

      // Re-compute the limit order boy
      setLimitOrder(newLimitOrder)
    })
  }

  // In the event that user choose native token as sell currency, offer to wrap it
  const handleCurrencyWrap = () => {}

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
                handleSellCurrenyAmountChange({ currency, amountWei, amountFormatted: formattedSellAmount })
              }}
              value={formattedSellAmount}
              onUserInput={formatedValue => {
                const amountFormatted = formatedValue.trim() === '' ? '0' : formatedValue
                const amountWei = parseUnits(formatedValue, sellTokenAmount?.currency?.decimals).toString()
                handleSellCurrenyAmountChange({
                  currency: sellTokenAmount?.currency as Token,
                  amountWei,
                  amountFormatted,
                })
              }}
              onMax={() => {
                if (!sellCurrencyMaxAmount) return

                handleSellCurrenyAmountChange({
                  currency: sellCurrencyMaxAmount?.currency as Token,
                  amountWei: sellCurrencyMaxAmount?.raw.toString(),
                  amountFormatted: sellCurrencyMaxAmount.toSignificant(),
                })
              }}
              maxAmount={sellCurrencyMaxAmount}
              fiatValue={fiatValueInput}
              isFallbackFiatValue={isFallbackFiatValueInput}
            />
            <SwitchIconContainer>
              <SwitchTokensAmountsContainer>
                <ArrowWrapper
                  clickable={!loading}
                  data-testid="switch-tokens-button"
                  className={loading ? 'rotate' : ''}
                >
                  <SwapIcon />
                </ArrowWrapper>
              </SwitchTokensAmountsContainer>
            </SwitchIconContainer>
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
                handleBuyCurrenyAmountChange({ currency, amountWei, amountFormatted: formattedBuyAmount })
              }}
              value={formattedBuyAmount}
              onUserInput={formatedValue => {
                const amountFormatted = formatedValue.trim() === '' ? '0' : formatedValue
                const amountWei = parseUnits(formatedValue, buyTokenAmount.currency.decimals).toString()
                handleBuyCurrenyAmountChange({
                  currency: buyTokenAmount.currency,
                  amountWei,
                  amountFormatted,
                })
              }}
              maxAmount={buyCurrencyMaxAmount}
              fiatValue={fiatValueOutput}
              isFallbackFiatValue={isFallbackFiatValueOutput}
            />
          </AutoColumn>
          <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
            <div>
              <OrderLimitPriceField id="limitPrice" />
            </div>
            <div>
              <OrderExpirayField id="limitOrderExpiry" />
            </div>
          </AutoRow>
          {Currency.isNative(sellTokenAmount.currency) ? (
            <ButtonPrimary onClick={handleCurrencyWrap}>Wrap</ButtonPrimary> // @todo remove this as Swapbox handles wrapping native tokens
          ) : (
            <ButtonPrimary onClick={reviewOrder}>Review Order</ButtonPrimary>
          )}
        </AutoColumn>
      </LimitOrderFormContext.Provider>
    </AppBody>
  )
}
