import { Currency, Token, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useContext, useEffect, useState } from 'react'
import { Flex } from 'rebass'

import { ButtonPrimary } from '../../../components/Button'
import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { Kind, MarketPrices } from '../../../services/LimitOrders'
import { LimitOrderContext } from '../../../services/LimitOrders/LimitOrder.provider'

import { AutoRow } from './Components/AutoRow'
import ConfirmLimitOrderModal from './Components/ConfirmLimitOrderModal'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import SwapTokens from './Components/SwapTokens'

export default function LimitOrderForm() {
  const protocol = useContext(LimitOrderContext)
  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)

  const [buyAmount, setBuyAmount] = useState(protocol.buyAmount)
  const [sellAmount, setSellAmount] = useState(protocol.sellAmount)

  const [sellToken, setSellToken] = useState<Token>(protocol.sellToken)
  const [buyToken, setBuyToken] = useState<Token>(protocol.buyToken)
  const [loading, setLoading] = useState<boolean>(protocol.loading)

  const [kind, setKind] = useState<Kind>(protocol?.kind || Kind.Sell)
  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const [isModalOpen, setIsModalOpen] = useState(false)

  const onModalDismiss = () => {
    setIsModalOpen(false)
    // setErrorMessage('')
  }

  useEffect(() => {
    async function getMarketPrice() {
      const amount = await protocol.getMarketPrice()
      setBuyAmount(protocol.buyAmount)
      setMarketPrices(marketPrice => ({ ...marketPrice, buy: amount }))
      setLoading(false)
    }
    setSellToken(protocol.sellToken)
    setBuyToken(protocol.buyToken)
    setSellAmount(protocol.sellAmount)
    setBuyAmount(protocol.buyAmount)
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
    protocol?.onSellTokenChange(newSellToken)
    protocol?.onKindChange(Kind.Sell)
    setKind(Kind.Sell)

    await protocol.getQuote()

    setBuyAmount(protocol.buyAmount)
    setLoading(false)
    // setMarketPrices(marketPrice => ({ ...marketPrice, buy: amount }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuyTokenChange = useCallback(async (currency: Currency, _isMaxAmount?: boolean) => {
    setLoading(true)
    const newBuyToken = protocol.getTokenFromCurrency(currency)
    setBuyToken(newBuyToken)
    protocol?.onBuyTokenChange(newBuyToken)
    protocol?.onKindChange(Kind.Buy)
    setKind(Kind.Buy)

    await protocol.getQuote()

    setSellAmount(protocol.sellAmount)
    setLoading(false)
    // setMarketPrices(marketPrice => ({ ...marketPrice, sell: amount }))

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSellAmountChange = useCallback(async (value: string) => {
    if (value.trim() !== '' && value !== '0') {
      const amountWei = parseUnits(value, sellToken.decimals).toString()
      const newSellAmount = new TokenAmount(sellToken, amountWei)

      setLoading(true)

      protocol?.onSellAmountChange(newSellAmount)
      setSellAmount(newSellAmount)

      protocol?.onKindChange(Kind.Sell)
      setKind(Kind.Sell)

      await protocol.getQuote()

      setBuyAmount(protocol.buyAmount)
      setLoading(false)
      // setMarketPrices(marketPrice => ({ ...marketPrice, buy: amount }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuyAmountChange = useCallback(async (value: string) => {
    if (value.trim() !== '' && value !== '0') {
      const amountWei = parseUnits(value, buyToken.decimals).toString()
      const newBuyAmount = new TokenAmount(buyToken, amountWei)

      setLoading(true)

      protocol?.onBuyAmountChange(newBuyAmount)
      setBuyAmount(newBuyAmount)

      protocol?.onKindChange(Kind.Buy)
      setKind(Kind.Buy)

      await protocol.getQuote()

      setSellAmount(protocol.sellAmount)
      setLoading(false)
      // setMarketPrices(marketPrice => ({ ...marketPrice, sell: amount }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSwap = useCallback(async () => {
    setLoading(true)
    protocol.onSellTokenChange(buyToken)
    protocol.onBuyTokenChange(sellToken)
    setSellToken(buyToken)
    setBuyToken(sellToken)
    setKind(Kind.Sell)

    await protocol.getQuote()

    setBuyAmount(protocol.buyAmount)
    setLoading(false)
  }, [sellToken, buyToken, protocol])

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
          />
          <SwapTokens swapTokens={handleSwap} loading={loading} />
          <CurrencyInputPanel
            id="limit-order-buy-currency"
            value={protocol.getFormattedAmount(buyAmount)}
            currency={buyToken}
            onUserInput={handleBuyAmountChange}
            onMax={() => {
              console.log('onMax')
            }}
            showNativeCurrency={false}
            onCurrencySelect={handleBuyTokenChange}
            currencyOmitList={[sellToken.address]}
          />
        </AutoColumn>
        <AutoRow justify="space-between" flexWrap="nowrap" gap="12">
          <Flex flex={60}>
            <OrderLimitPriceField
              protocol={protocol}
              marketPrices={marketPrices}
              fetchMarketPrice={fetchMarketPrice}
              setFetchMarketPrice={setFetchMarketPrice}
              sellToken={sellToken}
              buyToken={buyToken}
              sellAmount={sellAmount}
              buyAmount={buyAmount}
              kind={kind}
              limitOrder={protocol.limitOrder}
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
