import { Currency, Token, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Flex } from 'rebass'

import { ButtonPrimary } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { useHigherUSDValue } from '../../../hooks/useUSDValue'
import { Kind, MarketPrices } from '../../../services/LimitOrders'
import { LimitOrderContext } from '../../../services/LimitOrders/LimitOrder.provider'
import { useCurrencyBalances } from '../../../state/wallet/hooks'
import { maxAmountSpend } from '../../../utils/maxAmountSpend'

import { AutoRow } from './Components/AutoRow'
import ConfirmLimitOrderModal from './Components/ConfirmLimitOrderModal'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import SwapTokens from './Components/SwapTokens'

export default function LimitOrderForm() {
  const protocol = useContext(LimitOrderContext)

  const [buyAmount, setBuyAmount] = useState(protocol.buyAmount)
  const [sellAmount, setSellAmount] = useState(protocol.sellAmount)

  const [sellToken, setSellToken] = useState<Token>(protocol.sellToken)
  const [buyToken, setBuyToken] = useState<Token>(protocol.buyToken)
  const [loading, setLoading] = useState<boolean>(protocol.loading)

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

  const [kind, setKind] = useState<Kind>(protocol?.kind || Kind.Sell)
  // TODO: Check the usage of marketPrices
  const [marketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const [isModalOpen, setIsModalOpen] = useState(false)

  const onModalDismiss = () => {
    setIsModalOpen(false)
    // setErrorMessage('')
  }

  useEffect(() => {
    async function getMarketPrice() {
      await protocol.getMarketPrice()
      setBuyAmount(protocol.buyAmount)

      setLoading(false)
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

    await protocol?.onSellTokenChange(newSellToken)

    protocol.onLimitPriceChange(protocol.getLimitPrice())

    setSellAmount(protocol.sellAmount)
    setBuyAmount(protocol.buyAmount)

    setLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuyTokenChange = useCallback(async (currency: Currency) => {
    setLoading(true)
    const newBuyToken = protocol.getTokenFromCurrency(currency)

    setBuyToken(newBuyToken)

    setKind(Kind.Buy)

    protocol.onKindChange(Kind.Buy)

    await protocol?.onBuyTokenChange(newBuyToken)

    protocol.onLimitPriceChange(protocol.getLimitPrice())

    setSellAmount(protocol.sellAmount)
    setBuyAmount(protocol.buyAmount)
    setLoading(false)

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
      setLoading(false)
    }
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
      setLoading(false)
    }
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

    await protocol.getQuote()

    setBuyAmount(protocol.buyAmount)
    setSellAmount(protocol.sellAmount)
    setLoading(false)
  }

  return (
    <>
      <ConfirmLimitOrderModal
        onConfirm={() => {}}
        onDismiss={onModalDismiss}
        isOpen={isModalOpen}
        errorMessage={''}
        attemptingTxn={loading}
        marketPrices={marketPrices}
        fiatValueInput={sellAmount}
        fiatValueOutput={buyAmount}
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
          <Flex flex={60}>
            <OrderLimitPriceField
              protocol={protocol}
              // marketPrices={marketPrices}
              // fetchMarketPrice={fetchMarketPrice}
              // setFetchMarketPrice={setFetchMarketPrice}
              sellToken={sellToken}
              buyToken={buyToken}
              sellAmount={sellAmount}
              buyAmount={buyAmount}
              kind={kind}
              setSellAmount={setSellAmount}
              setBuyAmount={setBuyAmount}
              setKind={setKind}
            />
          </Flex>
          <Flex flex={40}>
            <OrderExpiryField />
          </Flex>
        </AutoRow>
        <ButtonPrimary onClick={() => setIsModalOpen(true)}>Place Limit Order</ButtonPrimary>
      </AutoColumn>
    </>
  )
}
