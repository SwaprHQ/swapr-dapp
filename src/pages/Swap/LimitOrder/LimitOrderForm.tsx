import { Currency, Token, TokenAmount } from '@swapr/sdk'

import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { useContext, useEffect, useState } from 'react'
import { Flex } from 'rebass'

import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { Kind, MarketPrices } from '../../../services/LimitOrders'
import { LimitOrderContext } from '../../../services/LimitOrders/LimitOrder.provider'

import { AutoRow } from './Components/AutoRow'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import SwapTokens from './Components/SwapTokens'

export default function LimitOrderForm() {
  const protocol = useContext(LimitOrderContext)

  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sellAmount, setSellAmount] = useState(protocol.sellAmount)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [buyAmount, setBuyAmount] = useState(protocol.buyAmount)

  const [sellToken, setSellToken] = useState<Token>(protocol.sellToken)
  const [buyToken, setBuyToken] = useState<Token>(protocol.buyToken)

  const [kind, setKind] = useState<Kind>(protocol?.kind || Kind.Sell)

  useEffect(() => {
    setSellToken(protocol.sellToken)
    setBuyToken(protocol.buyToken)
    setSellAmount(protocol.sellAmount)
    setBuyAmount(protocol.buyAmount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.activeChainId])

  useEffect(() => {
    protocol?.onKindChange(kind)
  }, [protocol, kind])

  useEffect(() => {
    if (sellToken) {
      protocol?.onSellTokenChange(sellToken)
    }
    console.log('sellToken', protocol, sellToken)
  }, [protocol, sellToken])

  useEffect(() => {
    if (buyToken) {
      protocol?.onBuyTokenChange(buyToken)
    }
    console.log('buyToken', protocol, buyToken)
  }, [protocol, buyToken])

  useEffect(() => {
    if (sellAmount) {
      protocol?.onSellAmountChange(sellAmount)
    }
    console.log('sellAmount', protocol, sellAmount)
  }, [protocol, sellAmount])

  useEffect(() => {
    if (buyAmount) {
      protocol?.onSellAmountChange(buyAmount)
    }
    console.log('buyAmount', protocol, buyAmount)
  }, [protocol, buyAmount])

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  useEffect(() => {
    async function getMarketPrices() {
      if (!protocol) return
      const { kind } = protocol
      const amount = await protocol.getMarketPrice()

      if (kind === Kind.Sell) {
        setMarketPrices(marketPrice => ({ ...marketPrice, buy: amount }))
      } else {
        setMarketPrices(marketPrice => ({ ...marketPrice, sell: amount }))
      }
    }
    getMarketPrices()
  }, [protocol, protocol?.kind])

  return (
    <AutoColumn gap="12px">
      <AutoColumn gap="3px">
        <CurrencyInputPanel
          id="limit-order-sell-currency"
          value={formatUnits(sellAmount.raw.toString(), sellToken.decimals) || '0'}
          onUserInput={function (_value: string): void {
            // throw new Error('Function not implemented.')
            setKind(Kind.Sell)
            const amountWei = parseUnits(_value, sellToken.decimals).toString()
            setSellAmount(new TokenAmount(sellToken, amountWei))
          }}
          showNativeCurrency={false}
          currency={sellToken}
          onCurrencySelect={(currency: Currency, _isMaxAmount?: boolean) => {
            setSellToken(protocol.getTokenFromCurrency(currency))
          }}
        />
        <SwapTokens
          swapTokens={() => {
            setSellToken(buyToken)
            setBuyToken(sellToken)
          }}
          loading={false}
        />
        <CurrencyInputPanel
          id="limit-order-buy-currency"
          value={formatUnits(buyAmount.raw.toString(), sellToken.decimals) || '0'}
          currency={buyToken}
          onUserInput={function (_value: string): void {
            setKind(Kind.Buy)
            const amountWei = parseUnits(_value, buyToken.decimals).toString()
            setBuyAmount(new TokenAmount(buyToken, amountWei))
            // throw new Error('Function not implemented.')
          }}
          showNativeCurrency={false}
          onCurrencySelect={(currency: Currency, _isMaxAmount?: boolean) => {
            setBuyToken(protocol.getTokenFromCurrency(currency))
          }}
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
          />
        </Flex>
        <Flex flex={40}>
          <OrderExpiryField />
        </Flex>
      </AutoRow>
    </AutoColumn>
  )
}
