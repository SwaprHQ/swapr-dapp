import { Web3Provider } from '@ethersproject/providers'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Currency, JSBI, Price, Token, TokenAmount } from '@swapr/sdk'

import { useWhatChanged } from '@simbathesailor/use-what-changed'
import dayjs from 'dayjs'
import dayjsUTCPlugin from 'dayjs/plugin/utc'
import { FC, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as SwapIcon } from '../../../../assets/images/swap-icon.svg'
import { ButtonPrimary } from '../../../../components/Button'
import { AutoColumn } from '../../../../components/Column'
import { CurrencyInputPanel } from '../../../../components/CurrencyInputPanel'
import { Loader } from '../../../../components/Loader'
import ProgressSteps from '../../../../components/ProgressSteps'
import { AutoRow as AutoRowBase } from '../../../../components/Row'
import { ArrowWrapper, SwitchIconContainer, SwitchTokensAmountsContainer } from '../../../../components/Swap/styleds'
import { useTokenAllowance } from '../../../../data/Allowances'
import { ApprovalState, useApproveCallback } from '../../../../hooks/useApproveCallback'
import { useHigherUSDValue } from '../../../../hooks/useUSDValue'
import AppBody from '../../../../pages/AppBody'
import { useCurrencyBalances } from '../../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../../utils/maxAmountSpend'
import { getQuote, getVaultRelayerAddress, signLimitOrder, submitLimitOrder } from '../../api'
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

interface HandleCurrenyAmountChangeParams {
  currency: Currency
  amountWei: string
  amountFormatted: string
  updatedLimitOrder?: SerializableLimitOrder
}

interface ApprovalFlowProps {
  approval: ApprovalState
  approveCallback: () => Promise<void>
  // approvalSubmitted: boolean
  tokenInSymbol: string
}

export const ApprovalFlow: FC<ApprovalFlowProps> = ({
  approval,
  // approvalSubmitted,
  approveCallback,
  tokenInSymbol,
}) => (
  <>
    <ButtonPrimary
      onClick={approveCallback}
      disabled={approval !== ApprovalState.NOT_APPROVED /* || approvalSubmitted */}
      altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
      //   confirmed={approval === ApprovalState.APPROVED}
    >
      {approval === ApprovalState.PENDING ? (
        <AutoRow gap="6px" justify="center">
          Approving <Loader />
        </AutoRow>
      ) : (
        // : approvalSubmitted && approval === ApprovalState.APPROVED ? (
        // 'Approved'
        // ) :
        'Approve ' + tokenInSymbol
      )}
    </ButtonPrimary>
    <div style={{ marginTop: '1rem' }}>
      <ProgressSteps steps={[approval === ApprovalState.APPROVED]} />
    </div>
  </>
)

/**
 * The Limit Order Form is the base component for all limit order forms.
 */
export function Form({ account, provider, chainId }: LimitOrderFormProps) {
  const [loading, setLoading] = useState(false)

  // Get the initial values and set the state
  const initialState = useRef(getInitialState(chainId, account)).current

  // Local state
  const [expiresInUnit, setExpiresInUnit] = useState(OrderExpiresInUnit.Minutes)
  const [expiresIn, setExpiresIn] = useState(20)

  // State holding the sell and buy currency amounts
  const [sellTokenAmount, setSellTokenAmount] = useState<TokenAmount>(initialState.sellTokenAmount)
  const [buyTokenAmount, setBuyTokenAmount] = useState<TokenAmount>(initialState.buyTokenAmount)

  // State holding the limit/order price
  const [price, setPrice] = useState<Price>(initialState.price)

  // const tokenInAllowance = useTokenAllowance(sellTokenAmount?.token, account, getVaultRelayerAddress(chainId))
  const [tokenInApproval, tokenInApprovalCallback] = useApproveCallback(
    sellTokenAmount,
    getVaultRelayerAddress(chainId)
  )
  // Final limit order to be sent to the internal API
  const [limitOrder, setLimitOrder] = useState<SerializableLimitOrder>(initialState.limitOrder)

  const setToMarket = async () => {
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
      console.log(buyTokenFormattedAmount)
      console.log({ cowQuote, feeAmount })
      const updatedLimitOrder = { ...limitOrder, limitPrice: buyAmount, feeAmount }
      setLimitOrder(updatedLimitOrder)
      handleBuyCurrenyAmountChange({
        currency: buyTokenAmount.currency,
        amountWei: buyAmount,
        amountFormatted: buyTokenFormattedAmount,
        updatedLimitOrder,
      })
      setFormattedLimitPrice(buyTokenFormattedAmount)
    }
  }

  useEffect(() => {
    setToMarket().catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // // Handles chainId change to update initial sell and buy currency amounts
  // useEffect(() => {
  //   // Get the initial values and set the state
  //   const initialState = getInitialState(chainId, account)
  //   setSellTokenAmount(initialState.sellTokenAmount)
  //   setBuyTokenAmount(initialState.buyTokenAmount)
  //   setPrice(initialState.price)
  //   setLimitOrder(initialState.limitOrder)
  //   handleInputOnChange(initialState.limitOrder.sellAmount)
  // }, [chainId, account, handleInputOnChange])

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(account, [
    sellTokenAmount.currency,
    buyTokenAmount?.currency,
  ])

  const swapTokens = useCallback(() => {
    setSellTokenAmount(buyTokenAmount)
    setBuyTokenAmount(sellTokenAmount)
    if (buyTokenAmount.currency.address && sellTokenAmount.currency.address) {
      setLimitOrder({
        ...limitOrder,
        sellToken: buyTokenAmount.currency.address,
        buyToken: sellTokenAmount.currency.address,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount, sellTokenAmount])

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

  // Determine if the token has to be approved first
  const showApproveFlow = tokenInApproval === ApprovalState.NOT_APPROVED || tokenInApproval === ApprovalState.PENDING

  // Form submission handler
  const reviewOrder = async () => {
    setLoading(true)

    // sign the order
    try {
      // // try to get allowance
      // const allowance = await tokenInAllowance
      // if (allowance === undefined) {
      //   throw new Error('Could not get allowance')
      // }

      // // if allowance is not enough, try to approve
      // if (allowance.lessThan(sellTokenAmount.raw)) {
      //   const approveTx = await approveCallback()
      //   if (approveTx === undefined) {
      //     throw new Error('Could not approve')
      //   }

      //   // check allowance again
      //   const allowance = await tokenInAllowance
      //   if (allowance === undefined) {
      //     throw new Error('Could not get allowance')
      //   }

      //   // if allowance is not enough, throw error
      //   if (allowance.lt(sellTokenAmount.raw)) {
      //     throw new Error('Could not approve')
      //   }

      //   // if allowance is enough, continue
      // }

      const signer = provider.getSigner()

      // get the quote and set the fee amount

      const finalizedLimitOrder = {
        ...limitOrder,
        expiresAt: dayjs().add(expiresIn, expiresInUnit).unix(),
      }
      const signedOrder = await signLimitOrder({
        order: finalizedLimitOrder,
        chainId,
        signer,
      })

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

  /**
   * Aggregate the sell currency amount state variables into a single value
   */
  const handleSellCurrenyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrenyAmountChangeParams) => {
    // Construct a new token amount and format it
    const newLimitOrder = {
      ...updatedLimitOrder,
      sellAmount: amountWei,
    }
    setFormattedSellAmount(amountFormatted) // update the token amount input
    // Update the buy currency amount if the user has selected a token
    newLimitOrder.sellToken = currency.address as string
    // Update relevant state variables
    const newSellTokenAmount = new TokenAmount(currency as Token, amountWei)
    setSellTokenAmount(newSellTokenAmount)
    console.log('SELL TOKEN')
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
  }

  useWhatChanged([limitOrder], `limitOrder`)

  /**
   * Aggregate the buy currency amount state variables into a single value
   */
  const handleBuyCurrenyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    updatedLimitOrder = limitOrder,
  }: HandleCurrenyAmountChangeParams) => {
    // Construct a new token amount and format it

    const newLimitOrder = {
      ...updatedLimitOrder,
      buyAmount: amountWei,
    }
    console.log('BUY TOKEN')
    console.log(limitOrder.limitPrice + ' * ' + amountFormatted)

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
  }

  const handleInputOnChange = async (formatedValue: string) => {
    const amountFormatted = formatedValue.trim() === '' ? '0' : formatedValue
    const amountWei = parseUnits(formatedValue, sellTokenAmount?.currency?.decimals).toString()
    handleSellCurrenyAmountChange({
      currency: sellTokenAmount?.currency as Token,
      amountWei,
      amountFormatted,
    })
    // const signer = provider.getSigner()
    // const cowQuote = await getQuote({ chainId, signer, order: limitOrder })
    // if (cowQuote) {
    //   const {
    //     quote: { buyAmount, feeAmount },
    //   } = cowQuote
    //   const buyTokenFormattedAmount = formatUnits(buyAmount, buyTokenAmount.currency.decimals)
    //   setLimitOrder({ ...limitOrder, limitPrice: buyAmount })
    //   console.log({ buyTokenFormattedAmount })
    //   handleBuyCurrenyAmountChange({
    //     currency: buyTokenAmount.currency,
    //     amountWei: buyAmount,
    //     amountFormatted: buyTokenFormattedAmount,
    //   })
    //   setFormattedLimitPrice(buyTokenFormattedAmount)
    // }
  }

  // Handles chainId change to update initial sell and buy currency amounts
  // useEffect(() => {
  //   // Get the initial values and set the state
  //   const initialState = getInitialState(chainId, account)
  //   setSellTokenAmount(initialState.sellTokenAmount)
  //   setBuyTokenAmount(initialState.buyTokenAmount)
  //   setPrice(initialState.price)
  //   const { sellToken, buyToken } = initialState.limitOrder
  //   setLimitOrder(limitOrder => ({ ...limitOrder, sellToken, buyToken }))
  // handleInputOnChange(formatUnits(initialState.limitOrder.sellAmount, initialState.sellTokenAmount.currency.decimals))
  // const getValueQuote = async () => {

  // getValueQuote()
  // }, [chainId, account])

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
              onUserInput={handleInputOnChange}
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
            <SwitchIconContainer
              onClick={() => {
                swapTokens()
              }}
            >
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
          ) : showApproveFlow ? (
            <ApprovalFlow
              tokenInSymbol={sellTokenAmount.currency.symbol as string}
              approval={tokenInApproval}
              approveCallback={tokenInApprovalCallback}
              // approvalSubmitted={approvalSubmitted}
            />
          ) : (
            <ButtonPrimary onClick={reviewOrder}>Review Order</ButtonPrimary>
          )}
        </AutoColumn>
      </LimitOrderFormContext.Provider>
    </AppBody>
  )
}
