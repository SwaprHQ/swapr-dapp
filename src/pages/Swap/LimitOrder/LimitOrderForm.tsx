import { Currency, Token, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'
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
  console.log('protocol', protocol)
  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sellAmount, setSellAmount] = useState(protocol.sellAmount)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [buyAmount, setBuyAmount] = useState(protocol.buyAmount)

  const [sellToken, setSellToken] = useState<Token>(protocol.sellToken)
  const [buyToken, setBuyToken] = useState<Token>(protocol.buyToken)
  const [loading, setLoading] = useState<boolean>(protocol.loading)

  const [kind, setKind] = useState<Kind>(protocol?.kind || Kind.Sell)

  useEffect(() => {
    setSellToken(protocol.sellToken)
    setBuyToken(protocol.buyToken)
    setSellAmount(protocol.sellAmount)
    setBuyAmount(protocol.buyAmount)
    protocol.getMarketPrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol.activeChainId])

  useEffect(() => {
    setLoading(protocol.loading)
  }, [protocol.loading])

  useEffect(() => {
    protocol?.onKindChange(kind)
  }, [protocol, kind])

  useEffect(() => {
    if (sellToken) {
      protocol?.onSellTokenChange(sellToken)
    }
  }, [protocol, sellToken])

  useEffect(() => {
    if (buyToken) {
      protocol?.onBuyTokenChange(buyToken)
    }
  }, [protocol, buyToken])

  useEffect(() => {
    async function getMarketPrices() {
      if (!protocol || !sellAmount) return
      if (kind === Kind.Sell) {
        setLoading(true)
        await protocol.getMarketPrice()
        setBuyAmount(protocol.buyAmount)
      }
    }

    if (sellAmount) {
      protocol?.onSellAmountChange(sellAmount)
      getMarketPrices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol, sellAmount])

  useEffect(() => {
    async function getMarketPrices() {
      if (!protocol || !buyAmount) return
      if (kind === Kind.Buy) {
        setLoading(true)
        await protocol.getMarketPrice()
        setSellAmount(protocol.sellAmount)
      }
    }

    if (buyAmount) {
      protocol?.onBuyAmountChange(buyAmount)
      getMarketPrices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [protocol, buyAmount])

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  // TODO: REMOVE THIS USEEFFECT
  useEffect(() => {
    async function _getMarketPrices() {
      if (!protocol) return
      const { kind } = protocol
      setLoading(true)
      const amount = await protocol.getMarketPrice()

      if (kind === Kind.Sell) {
        // TODO: MOVE THIS LOGIC
        setMarketPrices(marketPrice => ({ ...marketPrice, buy: amount }))
      } else {
        setMarketPrices(marketPrice => ({ ...marketPrice, sell: amount }))
      }
    }
    // getMarketPrices()
  }, [protocol, protocol?.kind])

  return (
    <AutoColumn gap="12px">
      <AutoColumn gap="3px">
        <CurrencyInputPanel
          id="limit-order-sell-currency"
          value={protocol.getFormattedAmount(sellAmount)}
          onUserInput={function (_value: string) {
            setKind(Kind.Sell)
            const amountWei = parseUnits(_value, sellToken.decimals).toString()
            setSellAmount(new TokenAmount(sellToken, amountWei))
          }}
          showNativeCurrency={false}
          currency={sellToken}
          onCurrencySelect={(currency: Currency, _isMaxAmount?: boolean) => {
            setSellToken(protocol.getTokenFromCurrency(currency))
          }}
          currencyOmitList={[buyToken.address]}
        />
        <SwapTokens
          swapTokens={() => {
            setSellToken(buyToken)
            setBuyToken(sellToken)
          }}
          loading={loading}
        />
        <CurrencyInputPanel
          id="limit-order-buy-currency"
          value={protocol.getFormattedAmount(buyAmount)}
          currency={buyToken}
          onUserInput={function (_value: string) {
            setKind(Kind.Buy)
            const amountWei = parseUnits(_value, buyToken.decimals).toString()
            setBuyAmount(new TokenAmount(buyToken, amountWei))
          }}
          currencyOmitList={[sellToken.address]}
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
