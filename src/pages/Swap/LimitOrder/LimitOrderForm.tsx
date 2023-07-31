import { Currency, Token, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flex } from 'rebass'

import { ButtonPrimary } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useHigherUSDValue } from '../../../hooks/useUSDValue'
import { Kind, LimitOrderBase, MarketPrices } from '../../../services/LimitOrders'
import { getVaultRelayerAddress } from '../../../services/LimitOrders/CoW/api/cow'
import { useNotificationPopup } from '../../../state/application/hooks'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'

import { ApprovalFlow } from './Components/ApprovalFlow'
import { AutoRow } from './Components/AutoRow'
import ConfirmLimitOrderModal from './Components/ConfirmLimitOrderModal'
import { MaxAlert } from './Components/MaxAlert'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import { SetToMarket } from './Components/OrderLimitPriceField/styles'
import SwapTokens from './Components/SwapTokens'
import { formatMarketPrice, formatMaxValue } from './Components/utils'

export default function LimitOrderForm({ protocol }: { protocol: LimitOrderBase }) {
  const notify = useNotificationPopup()

  const [buyAmount, setBuyAmount] = useState(protocol.buyAmount)
  const [sellAmount, setSellAmount] = useState(protocol.sellAmount)

  const [sellToken, setSellToken] = useState<Token>(protocol.sellToken)
  const [buyToken, setBuyToken] = useState<Token>(protocol.buyToken)
  const [loading, setLoading] = useState<boolean>(protocol.loading)

  const [isPossibleToOrder, setIsPossibleToOrder] = useState({
    status: false,
    value: 0,
  })

  const [sellCurrencyBalance, buyCurrencyBalance] = useCurrencyBalances(protocol.userAddress, [
    sellAmount.currency,
    buyAmount?.currency,
  ])

  const sellCurrencyMaxAmount = maxAmountSpend(sellCurrencyBalance, protocol.activeChainId)
  const buyCurrencyMaxAmount = maxAmountSpend(buyCurrencyBalance, protocol.activeChainId, false)

  const { fiatValueInput, fiatValueOutput, isFallbackFiatValueInput, isFallbackFiatValueOutput } = useHigherUSDValue({
    inputCurrencyAmount: sellAmount,
    outputCurrencyAmount: buyAmount,
  })

  const [tokenInApproval, tokenInApprovalCallback] = useApproveCallback(
    sellAmount,
    getVaultRelayerAddress(protocol.activeChainId!)
  )

  useEffect(() => {
    let totalSellAmount = Number(sellAmount.toExact() ?? 0)
    const maxAmountAvailable = Number(sellCurrencyMaxAmount?.toExact() ?? 0)

    if (totalSellAmount > 0 && maxAmountAvailable >= 0) {
      // if (protocol.quoteSellAmount && sellAmount.token.address === protocol.quoteSellAmount.token.address) {
      //   const quoteAmount = Number(protocol.quoteSellAmount.toExact() ?? 0)
      //   if (quoteAmount < totalSellAmount) {
      //     totalSellAmount = quoteAmount
      //   }
      // }

      if (totalSellAmount > maxAmountAvailable) {
        const maxSellAmountPossible = maxAmountAvailable < 0 ? 0 : maxAmountAvailable
        if (isPossibleToOrder.value !== maxSellAmountPossible || !isPossibleToOrder.status) {
          setIsPossibleToOrder({
            status: true,
            value: maxSellAmountPossible,
          })
        }
      } else {
        if (isPossibleToOrder.value !== 0 || isPossibleToOrder.status) {
          setIsPossibleToOrder({
            status: false,
            value: 0,
          })
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellAmount, buyAmount, sellCurrencyMaxAmount, sellToken, buyToken])

  // Determine if the token has to be approved first
  const showApproveFlow = tokenInApproval === ApprovalState.NOT_APPROVED || tokenInApproval === ApprovalState.PENDING

  const [kind, setKind] = useState<Kind>(protocol?.kind || Kind.Sell)

  const [isModalOpen, setIsModalOpen] = useState(false)

  const onModalDismiss = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    async function getMarketPrice() {
      try {
        await protocol.getMarketPrice()
        setBuyAmount(protocol.buyAmount)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    setSellToken(protocol.sellToken)
    setBuyToken(protocol.buyToken)
    setSellAmount(protocol.sellAmount)

    getMarketPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.activeChainId])

  useEffect(() => {
    setLoading(protocol.loading)
  }, [protocol.loading])

  useEffect(() => {
    protocol?.onKindChange(kind)
  }, [protocol, kind])

  const handleSellTokenChange = useCallback(async (currency: Currency, _isMaxAmount?: boolean) => {
    setLoading(true)
    const newSellToken = protocol.getTokenFromCurrency(currency)

    setSellToken(newSellToken)

    setKind(Kind.Sell)

    protocol.onKindChange(Kind.Sell)
    try {
      await protocol?.onSellTokenChange(newSellToken)

      protocol.onLimitPriceChange(protocol.getLimitPrice())

      setSellAmount(protocol.sellAmount)
      setBuyAmount(protocol.buyAmount)
    } finally {
      setIsPossibleToOrder({
        status: false,
        value: 0,
      })
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuyTokenChange = useCallback(async (currency: Currency) => {
    setLoading(true)
    const newBuyToken = protocol.getTokenFromCurrency(currency)

    setBuyToken(newBuyToken)

    setKind(Kind.Buy)

    protocol.onKindChange(Kind.Buy)
    try {
      await protocol?.onBuyTokenChange(newBuyToken)

      protocol.onLimitPriceChange(protocol.getLimitPrice())

      setSellAmount(protocol.sellAmount)
      setBuyAmount(protocol.buyAmount)
    } finally {
      setLoading(false)
      setIsPossibleToOrder({
        status: false,
        value: 0,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSellAmountChange = useCallback(async (value: string) => {
    if (value.trim() !== '' && value.trim() !== '0') {
      const amountWei = parseUnits(value, protocol.sellToken.decimals).toString()
      const newSellAmount = new TokenAmount(protocol.sellToken, amountWei)

      setLoading(true)
      setSellAmount(newSellAmount)

      protocol.onKindChange(Kind.Sell)
      const limitPrice = protocol.getLimitPrice()
      protocol.onLimitPriceChange(limitPrice)

      setKind(Kind.Sell)

      await protocol?.onSellAmountChange(newSellAmount)

      setBuyAmount(protocol.buyAmount)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuyAmountChange = useCallback(async (value: string) => {
    if (value.trim() !== '' && value !== '0') {
      const amountWei = parseUnits(value, protocol.buyToken.decimals).toString()
      const newBuyAmount = new TokenAmount(protocol.buyToken, amountWei)

      setLoading(true)
      setBuyAmount(newBuyAmount)

      protocol.onKindChange(Kind.Buy)
      const limitPrice = protocol.getLimitPrice()
      protocol.onLimitPriceChange(limitPrice)

      setKind(Kind.Buy)

      await protocol?.onBuyAmountChange(newBuyAmount)

      setSellAmount(protocol.sellAmount)
    }
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSwap = async () => {
    setLoading(true)
    const buyToken = protocol.buyToken
    const sellToken = protocol.sellToken

    protocol.onSellTokenChange(buyToken)
    protocol.onBuyTokenChange(sellToken)

    setSellToken(buyToken)
    setBuyToken(sellToken)
    setKind(Kind.Sell)
    try {
      await protocol.getQuote()
      setBuyAmount(protocol.buyAmount)
      setSellAmount(protocol.sellAmount)
    } finally {
      setLoading(false)
    }
  }

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const getMarketPrices = useCallback(async () => {
    const tokenSellAmount = Number(sellAmount.toExact()) > 1 ? sellAmount.toExact() : '1'
    const tokenBuyAmount = Number(buyAmount.toExact()) > 1 ? buyAmount.toExact() : '1'

    const cowQuote = await protocol.getRawQuote()

    if (cowQuote) {
      const { buyAmount: quoteBuyAmount, sellAmount: quoteSellAmount } = cowQuote

      if (protocol.kind === Kind.Sell) {
        setMarketPrices(marketPrice => ({
          ...marketPrice,
          buy: formatMarketPrice(quoteBuyAmount, buyAmount.currency.decimals, tokenSellAmount),
        }))
      } else {
        setMarketPrices(marketPrice => ({
          ...marketPrice,
          sell: formatMarketPrice(quoteSellAmount, sellAmount.currency.decimals, tokenBuyAmount),
        }))
      }
    }
  }, [buyAmount, protocol, sellAmount])

  useEffect(() => {
    getMarketPrices()
  }, [getMarketPrices, kind])

  useEffect(() => {
    setMarketPrices({ buy: 0, sell: 0 })
  }, [sellToken, buyToken])

  // Form submission handler
  const createLimitOrder = async () => {
    setLoading(true)

    const successCallback = () => {
      notify(
        <>
          Successfully created limit order. Please check <Link to="/account">user account</Link> for details
        </>
      )
      setLoading(false)
    }

    const errorCallback = (error: Error) => {
      console.error(error)
      notify('Failed to place limit order. Try again.', false)
    }

    const final = () => setLoading(false)

    const response = await protocol.createOrder(successCallback, errorCallback, final)
    console.dir(response)
  }

  const handleGetMarketPrice = async () => {
    protocol.loading = true
    setLoading(true)

    protocol.onUserUpadtedLimitPrice(false)
    await protocol.getQuote()
    protocol.loading = false
    setLoading(false)
    if (kind === Kind.Sell) {
      setBuyAmount(protocol.buyAmount)
    } else {
      setSellAmount(protocol.sellAmount)
    }
    const limitPrice = protocol.getLimitPrice()
    protocol.onLimitPriceChange(limitPrice)
    return limitPrice
  }

  return (
    <>
      <ConfirmLimitOrderModal
        onConfirm={createLimitOrder}
        onDismiss={onModalDismiss}
        isOpen={isModalOpen}
        errorMessage={''}
        attemptingTxn={loading}
        marketPrices={marketPrices}
        fiatValueInput={fiatValueInput}
        fiatValueOutput={fiatValueOutput}
        protocol={protocol}
      />
      <AutoColumn gap="12px">
        <AutoColumn gap="3px">
          <CurrencyInputPanel
            id="limit-order-sell-currency"
            value={protocol.getFormattedAmount(sellAmount)}
            onUserInput={handleSellAmountChange}
            showNativeCurrency={false}
            currency={sellToken}
            onCurrencySelect={handleSellTokenChange}
            currencyOmitList={[buyToken.address]}
            disabled={loading}
            onMax={() => {
              if (sellCurrencyMaxAmount !== undefined && parseFloat(sellCurrencyMaxAmount.toExact() ?? '0') > 0) {
                handleSellAmountChange(parseFloat(sellCurrencyMaxAmount?.toExact()).toFixed(6))
              }
            }}
            fiatValue={fiatValueInput}
            isFallbackFiatValue={isFallbackFiatValueInput}
          />
          <SwapTokens swapTokens={handleSwap} loading={loading} />
          <CurrencyInputPanel
            id="limit-order-buy-currency"
            value={protocol.getFormattedAmount(buyAmount)}
            currency={buyToken}
            onUserInput={handleBuyAmountChange}
            onMax={() => {
              if (buyCurrencyMaxAmount !== undefined && parseFloat(buyCurrencyMaxAmount.toExact() ?? '0') > 0) {
                handleBuyAmountChange(parseFloat(buyCurrencyMaxAmount.toExact()).toFixed(6))
              }
            }}
            showNativeCurrency={false}
            onCurrencySelect={handleBuyTokenChange}
            currencyOmitList={[sellToken.address]}
            disabled={loading}
            fiatValue={fiatValueOutput}
            isFallbackFiatValue={isFallbackFiatValueOutput}
          />
        </AutoColumn>
        <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
          <Flex flex={65}>
            <OrderLimitPriceField
              protocol={protocol}
              marketPrices={marketPrices}
              sellToken={sellToken}
              buyToken={buyToken}
              sellAmount={sellAmount}
              buyAmount={buyAmount}
              kind={kind}
              setSellAmount={setSellAmount}
              setBuyAmount={setBuyAmount}
              setKind={setKind}
              setLoading={setLoading}
              handleGetMarketPrice={handleGetMarketPrice}
            />
          </Flex>
          <Flex flex={35}>
            <OrderExpiryField protocol={protocol} />
          </Flex>
        </AutoRow>
        {showApproveFlow ? (
          <ApprovalFlow
            tokenInSymbol={sellAmount.currency.symbol as string}
            approval={tokenInApproval}
            approveCallback={tokenInApprovalCallback}
          />
        ) : (
          <>
            {protocol.quoteErrorMessage && (
              <MaxAlert>
                <span>
                  {protocol.quoteErrorMessage}
                  {'  '}
                  <SetToMarket onClick={handleGetMarketPrice}>Please try again</SetToMarket>
                </span>
              </MaxAlert>
            )}
            {isPossibleToOrder.status && (
              <MaxAlert>
                {isPossibleToOrder.value > 0 ? (
                  `Max possible amount with fees for ${sellToken.symbol} is ${formatMaxValue(isPossibleToOrder.value)}.`
                ) : isPossibleToOrder.value === 0 ? (
                  `You dont have a positive balance for ${sellToken.symbol}.`
                ) : (
                  <span>
                    Some error occurred.
                    {'  '}
                    <SetToMarket onClick={handleGetMarketPrice}>Please try again</SetToMarket>
                  </span>
                )}
              </MaxAlert>
            )}
            <ButtonPrimary onClick={() => setIsModalOpen(true)} disabled={isPossibleToOrder.status}>
              Place Limit Order
            </ButtonPrimary>
          </>
        )}
      </AutoColumn>
    </>
  )
}
