import { Web3Provider } from '@ethersproject/providers'
import { parseUnits } from '@ethersproject/units'
import { ChainId, Currency, CurrencyAmount, JSBI, Token, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import dayjsUTCPlugin from 'dayjs/plugin/utc'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePrevious } from 'react-use'
import { Flex } from 'rebass'

import { ButtonPrimary } from '../../../../../components/Button'
import { AutoColumn } from '../../../../../components/Column'
import { CurrencyInputPanel } from '../../../../../components/CurrencyInputPanel'
import { PageMetaData } from '../../../../../components/PageMetaData'
import { REFETCH_DATA_INTERVAL } from '../../../../../constants/data'
import { ApprovalState, useApproveCallback } from '../../../../../hooks/useApproveCallback'
import { useNotificationPopup } from '../../../../../state/application/hooks'
import { useCurrencyBalances } from '../../../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../../../utils/maxAmountSpend'
import AppBody from '../../../../AppBody'
import { createCoWLimitOrder, getQuote, getVaultRelayerAddress } from '../../api/cow'
import { GET_QUOTE_EXPIRY_MINUTES } from '../../constants'
import { LimitOrderFormContext } from '../../contexts/LimitOrderFormContext'
import { InputFocus, LimitOrderKind, MarketPrices, OrderExpiresInUnit } from '../../interfaces'
import { computeNewAmount } from '../../utils'
import { ApprovalFlow } from '../ApprovalFlow'
import ConfirmLimitOrderModal from '../ConfirmLimitOrderModal'
import { CurrencySelectTooltip } from '../CurrencySelectTooltip'
import { OrderExpiryField } from '../OrderExpiryField'
import { OrderLimitPriceField } from '../OrderLimitPriceField'
import SwapTokens from '../SwapTokens'
import { AutoRow, MaxAlert } from './styles'
import { checkMaxOrderAmount, formatMarketPrice, formatMaxValue, toFixedSix } from './utils'

dayjs.extend(dayjsUTCPlugin)

interface HandleCurrencyAmountChangeParams {
  currency: Currency
  amountWei: string
  amountFormatted: string
  inputFocus?: InputFocus
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
  const {
    limitOrder,
    setLimitOrder,
    buyTokenAmount,
    setBuyTokenAmount,
    sellTokenAmount,
    setSellTokenAmount,
    formattedLimitPrice,
    setFormattedLimitPrice,
    formattedBuyAmount,
    setFormattedBuyAmount,
    formattedSellAmount,
    setFormattedSellAmount,
    expiresIn,
    expiresInUnit,
    inputFocus,
    setInputFocus,
    fiatValueInput,
    fiatValueOutput,
    isFallbackFiatValueInput,
    isFallbackFiatValueOutput,
  } = useContext(LimitOrderFormContext)

  const [loading, setLoading] = useState(false)
  const notify = useNotificationPopup()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  // IsPossibleToOrder
  const [isPossibleToOrder, setIsPossibleToOrder] = useState({
    status: false,
    value: 0,
  })

  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)
  const [marketPriceInterval, setMarketPriceInterval] = useState<NodeJS.Timer | undefined>()

  const [tokenInApproval, tokenInApprovalCallback] = useApproveCallback(
    sellTokenAmount,
    getVaultRelayerAddress(chainId)
  )

  const onModalDismiss = () => {
    setIsModalOpen(false)
    setErrorMessage('')
  }

  const setToMarket = useCallback(async () => {
    const signer = provider.getSigner()
    if (!limitOrder.buyToken || !limitOrder.sellToken) {
      return
    }

    const order = JSON.parse(JSON.stringify(limitOrder))

    const token = limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount : buyTokenAmount

    const tokenAmount = Number(token.toExact()) > 1 ? token.toExact() : '1'

    order.sellAmount = parseUnits(tokenAmount, token.currency.decimals).toString()

    const cowQuote = await getQuote({
      chainId,
      signer,
      order: { ...order, expiresAt: dayjs().add(GET_QUOTE_EXPIRY_MINUTES, OrderExpiresInUnit.Minutes).unix() },
    })

    if (cowQuote !== undefined) {
      const {
        quote: { buyAmount, sellAmount },
      } = cowQuote

      const nextLimitPriceFloat =
        limitOrder.kind === LimitOrderKind.SELL
          ? formatMarketPrice(buyAmount, buyTokenAmount.currency.decimals, tokenAmount)
          : formatMarketPrice(sellAmount, sellTokenAmount.currency.decimals, tokenAmount)

      const limitPrice = parseUnits(
        nextLimitPriceFloat.toFixed(6),
        limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount.currency.decimals : buyTokenAmount.currency.decimals
      ).toString()

      const { amount, buyAmountWei, sellAmountWei, newBuyTokenAmount, newSellTokenAmount } = computeNewAmount(
        buyTokenAmount,
        sellTokenAmount,
        nextLimitPriceFloat,
        limitOrder.kind,
        inputFocus
      )

      setFormattedLimitPrice(toFixedSix(nextLimitPriceFloat))

      if (inputFocus === InputFocus.SELL) {
        setBuyTokenAmount(newBuyTokenAmount)
        setFormattedBuyAmount(toFixedSix(amount))
        setLimitOrder(oldLimitOrder => ({
          ...oldLimitOrder,
          kind: limitOrder.kind,
          limitPrice: limitPrice,
          buyAmount: buyAmountWei,
        }))
      } else {
        setSellTokenAmount(newSellTokenAmount)
        setFormattedSellAmount(toFixedSix(amount))
        setLimitOrder(oldLimitOrder => ({
          ...oldLimitOrder,
          kind: limitOrder.kind,
          limitPrice: limitPrice,
          sellAmount: sellAmountWei,
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount, chainId, inputFocus, limitOrder, provider, sellTokenAmount])

  const setToMarketRef = useRef(setToMarket)

  useEffect(() => {
    setToMarketRef.current = setToMarket
  }, [setToMarket])

  useEffect(() => {
    const getMarketPrice = () => {
      setToMarketRef.current().catch(e => {
        console.error(e)
        setIsPossibleToOrder({
          status: true,
          value: 0,
        })
      })
    }

    let refetchMarketPrice: NodeJS.Timeout | undefined
    if (fetchMarketPrice) {
      getMarketPrice()

      refetchMarketPrice = setInterval(() => {
        getMarketPrice()
      }, REFETCH_DATA_INTERVAL)

      setMarketPriceInterval(refetchMarketPrice)
    } else {
      clearInterval(marketPriceInterval)
      setMarketPriceInterval(undefined)
    }

    return () => {
      setMarketPriceInterval(undefined)
      clearInterval(refetchMarketPrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyTokenAmount.currency, sellTokenAmount.currency, chainId, fetchMarketPrice])

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(account, [
    sellTokenAmount.currency,
    buyTokenAmount?.currency,
  ])

  // Fetch the maximum amount of tokens that can be bought or sold
  const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, chainId)
  const buyCurrencyMaxAmount = maxAmountSpend(buyCurrencyBalance, chainId, false)

  // Determine if the token has to be approved first
  const showApproveFlow = tokenInApproval === ApprovalState.NOT_APPROVED || tokenInApproval === ApprovalState.PENDING

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

  // Form submission handler
  const placeLimitOrder = async () => {
    setLoading(true)

    // sign the order
    try {
      const signer = provider.getSigner()

      const finalizedLimitOrder = {
        ...limitOrder,
        expiresAt: dayjs().add(expiresIn, expiresInUnit).unix(),
      }

      const response = await createCoWLimitOrder({
        chainId,
        signer,
        order: finalizedLimitOrder,
      })

      if (response) {
        notify(
          <>
            Successfully created limit order. Please check <Link to="/account">user account</Link> for details
          </>
        )
      } else {
        throw new Error(response)
      }
    } catch (error) {
      console.error(error)
      setErrorMessage('Failed to place limit order. Try again.')
      notify('Failed to place limit order. Try again.', false)
    } finally {
      setLoading(false)
    }
  }

  const previousSellAmount = usePrevious(sellCurrencyBalance)
  const newSellAmount = previousSellAmount?.raw.toString() !== sellCurrencyBalance?.raw.toString()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const amountWei = parseUnits(
        parseFloat(formattedSellAmount).toFixed(6),
        sellTokenAmount?.currency?.decimals
      ).toString()
      const expiresAt = dayjs().add(GET_QUOTE_EXPIRY_MINUTES, OrderExpiresInUnit.Minutes).unix()
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
    inputFocus,
  }: HandleCurrencyAmountChangeParams) => {
    if (Number(amountWei ?? 0) === 0) {
      setIsPossibleToOrder({ value: 0, status: true })
    }

    const limitPriceFloat = parseFloat(formattedLimitPrice)
    // Construct a new token amount and format it
    // Update the buy currency amount if the user has selected a token
    // Update relevant state variables
    const nextSellTokenAmount = new TokenAmount(currency as Token, amountWei)

    setFormattedSellAmount(amountFormatted) // update the token amount input

    const { amount: nextBuyAmountFloat, newBuyTokenAmount } = computeNewAmount(
      buyTokenAmount,
      nextSellTokenAmount,
      limitPriceFloat,
      limitOrder.kind,
      InputFocus.SELL
    )

    // Format the buy amount
    // Update buy amount state variables
    setBuyTokenAmount(newBuyTokenAmount)
    setFormattedBuyAmount(nextBuyAmountFloat ? toFixedSix(nextBuyAmountFloat) : '') // update the token amount input
    setSellTokenAmount(nextSellTokenAmount)
    // Re-compute the limit order buy
    setLimitOrder(oldLimitOrder => ({
      ...oldLimitOrder,
      sellAmount: amountWei,
      sellToken: currency.address as string,
    }))

    if (inputFocus) setInputFocus(inputFocus)
  }

  /**
   * Aggregate the buy currency amount state variables into a single value
   */
  const handleBuyCurrencyAmountChange = ({
    amountWei,
    currency,
    amountFormatted,
    inputFocus,
  }: HandleCurrencyAmountChangeParams) => {
    if (Number(amountWei ?? 0) === 0) {
      setIsPossibleToOrder({ value: 0, status: true })
    }

    // Construct a new token amount and format it
    const limitPriceFloat = parseFloat(formattedLimitPrice)

    const newBuyTokenAmount = new TokenAmount(currency as Token, amountWei)

    setFormattedBuyAmount(amountFormatted) // update the token amount input

    const { amount: nextSellAmountFloat, newSellTokenAmount } = computeNewAmount(
      newBuyTokenAmount,
      sellTokenAmount,
      limitPriceFloat,
      limitOrder.kind,
      InputFocus.BUY
    )

    // Format the sell amount
    // Update sell amount state variables
    setSellTokenAmount(newSellTokenAmount)
    setFormattedSellAmount(nextSellAmountFloat ? toFixedSix(nextSellAmountFloat) : '') // update the token amount input
    setBuyTokenAmount(newBuyTokenAmount)
    // Re-compute the limit order buy
    setLimitOrder(oldLimitOrder => ({
      ...oldLimitOrder,
      buyAmount: amountWei,
      buyToken: currency.address as string,
    }))

    if (inputFocus) setInputFocus(inputFocus)
  }

  const handleInputOnChange =
    (token: Token, inputFocus: InputFocus, handleAmountChange: Function) => (formattedValue: string) => {
      const amountFormatted = formattedValue.trim() === '' ? '0' : formattedValue
      const amountWei = parseUnits(formattedValue, token.decimals).toString()
      handleAmountChange({
        currency: token as Token,
        amountWei,
        amountFormatted,
        inputFocus,
      })
    }

  const handleCurrencySelect =
    (prevTokenAmount: TokenAmount, handleCurrencyAmountChange: Function, amountFormatted: string) =>
    (currency: Currency) => {
      let amountWei
      if (amountFormatted) amountWei = parseUnits(amountFormatted, currency?.decimals).toString()
      else if (prevTokenAmount?.raw) {
        const newAmount = JSBI.divide(
          JSBI.BigInt(prevTokenAmount.raw.toString()),
          JSBI.BigInt(10 ** prevTokenAmount?.currency?.decimals)
        ).toString()
        amountWei = parseUnits(newAmount, currency?.decimals).toString()
      } else amountWei = '0' // use 0 if no buy currency amount is set

      handleCurrencyAmountChange({ currency, amountWei, amountFormatted })
    }

  const handleOnMax = (amount: CurrencyAmount | undefined, hanldeCurrencyAmountChange: Function) => () => {
    if (!amount) return
    hanldeCurrencyAmountChange({
      currency: amount?.currency as Token,
      amountWei: amount?.raw.toString(),
      amountFormatted: amount.toSignificant(6),
    })
  }

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const getMarketPrices = useCallback(async () => {
    const signer = provider.getSigner()
    if (limitOrder.buyToken && limitOrder.sellToken) {
      const order = JSON.parse(JSON.stringify(limitOrder))

      const token = limitOrder.kind === LimitOrderKind.SELL ? sellTokenAmount : buyTokenAmount

      const tokenAmount = Number(token.toExact()) > 1 ? token.toExact() : '1'

      order.sellAmount = parseUnits(tokenAmount, token.currency.decimals).toString()

      const cowQuote = await getQuote({
        chainId,
        signer,
        order: { ...order, expiresAt: dayjs().add(GET_QUOTE_EXPIRY_MINUTES, OrderExpiresInUnit.Minutes).unix() },
      })

      if (cowQuote) {
        const {
          quote: { buyAmount, sellAmount },
        } = cowQuote

        if (limitOrder.kind === LimitOrderKind.SELL) {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            buy: formatMarketPrice(buyAmount, buyTokenAmount.currency.decimals, tokenAmount),
          }))
        } else {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            sell: formatMarketPrice(sellAmount, sellTokenAmount.currency.decimals, tokenAmount),
          }))
        }
      }
    }
  }, [buyTokenAmount, chainId, limitOrder, provider, sellTokenAmount])

  useEffect(() => {
    getMarketPrices()
  }, [limitOrder.kind, getMarketPrices])

  useEffect(() => {
    setMarketPrices({ buy: 0, sell: 0 })
  }, [limitOrder.sellToken, limitOrder.buyToken])

  return (
    <>
      <PageMetaData title="Limit | Swapr" />
      <AppBody>
        <ConfirmLimitOrderModal
          onConfirm={placeLimitOrder}
          onDismiss={onModalDismiss}
          isOpen={isModalOpen}
          errorMessage={errorMessage}
          attemptingTxn={loading}
          marketPrices={marketPrices}
        />
        <AutoColumn gap="12px">
          <AutoColumn gap="3px">
            <CurrencyInputPanel
              id="limit-order-box-sell-currency"
              currency={sellTokenAmount.currency}
              onCurrencySelect={handleCurrencySelect(
                sellTokenAmount,
                handleSellCurrencyAmountChange,
                formattedSellAmount
              )}
              value={formattedSellAmount}
              onUserInput={handleInputOnChange(
                sellTokenAmount.currency as Token,
                InputFocus.SELL,
                handleSellCurrencyAmountChange
              )}
              onMax={handleOnMax(sellCurrencyMaxAmount, handleSellCurrencyAmountChange)}
              maxAmount={sellCurrencyMaxAmount}
              fiatValue={fiatValueInput}
              isFallbackFiatValue={isFallbackFiatValueInput}
              showNativeCurrency={false}
              currencyOmitList={[buyTokenAmount.currency.address!]}
              currencySelectWrapper={CurrencySelectTooltip}
            />
            <SwapTokens swapTokens={handleSwapTokens} loading={loading} />
            <CurrencyInputPanel
              id="limit-order-box-buy-currency"
              currency={buyTokenAmount?.currency}
              onCurrencySelect={handleCurrencySelect(buyTokenAmount, handleBuyCurrencyAmountChange, formattedBuyAmount)}
              value={formattedBuyAmount}
              onUserInput={handleInputOnChange(
                buyTokenAmount.currency as Token,
                InputFocus.BUY,
                handleBuyCurrencyAmountChange
              )}
              onMax={handleOnMax(buyCurrencyMaxAmount, handleBuyCurrencyAmountChange)}
              maxAmount={buyCurrencyMaxAmount}
              fiatValue={fiatValueOutput}
              isFallbackFiatValue={isFallbackFiatValueOutput}
              showNativeCurrency={false}
              currencyOmitList={[sellTokenAmount.currency.address!]}
              currencySelectWrapper={CurrencySelectTooltip}
            />
          </AutoColumn>
          <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
            <Flex flex={60}>
              <OrderLimitPriceField
                id="limitPrice"
                marketPrices={marketPrices}
                fetchMarketPrice={fetchMarketPrice}
                setFetchMarketPrice={setFetchMarketPrice}
              />
            </Flex>
            <Flex flex={40}>
              <OrderExpiryField id="limitOrderExpiry" />
            </Flex>
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
              <ButtonPrimary onClick={() => setIsModalOpen(true)} disabled={isPossibleToOrder.status}>
                Place Limit Order
              </ButtonPrimary>
            </>
          )}
        </AutoColumn>
      </AppBody>
    </>
  )
}
