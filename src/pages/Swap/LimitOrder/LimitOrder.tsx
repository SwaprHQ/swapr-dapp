import dayjs from 'dayjs'
import { parseUnits } from 'ethers/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Flex } from 'rebass'

import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { PageMetaData } from '../../../components/PageMetaData'
import { useActiveWeb3React } from '../../../hooks'
import LimitOrder, {
  Kind,
  LimitOrderChangeHandler,
  MarketPrices,
  OrderExpiresInUnit,
} from '../../../services/LimitOrders'
import { LimitOrderProvider } from '../../../services/LimitOrders/LimitOrder.provider'
import AppBody from '../../AppBody'

import { getQuote } from './api/cow'
import { AutoRow } from './Components/AutoRow'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import SwapTokens from './Components/SwapTokens'
import { formatMarketPrice } from './Components/utils'

export default function LimitOrderUI() {
  const limitSdk = useRef(new LimitOrder()).current

  const { chainId, account, library } = useActiveWeb3React()

  const [protocol, setProtocol] = useState(limitSdk.getactiveProtocol())
  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)

  useEffect(() => {
    async function updateSigner(signerData: LimitOrderChangeHandler) {
      await limitSdk.updateSigner(signerData)
      setProtocol(limitSdk.getactiveProtocol())
    }
    if (chainId && account && library) {
      updateSigner({ activeChainId: chainId, account, activeProvider: library })
    }
  }, [account, chainId, library, limitSdk])

  const [marketPrices, setMarketPrices] = useState<MarketPrices>({ buy: 0, sell: 0 })

  const getMarketPrices = useCallback(async () => {
    if (!protocol) return
    const { buyToken, sellToken, provider, limitOrder, kind, sellAmount, buyAmount, activeChainId } = protocol

    if (buyToken && sellToken && provider && limitOrder && activeChainId) {
      const signer = provider.getSigner()
      const order = JSON.parse(JSON.stringify(limitOrder))

      const tokenAmountSelected = kind === Kind.Sell ? sellAmount : buyAmount
      const tokenSelected = kind === Kind.Sell ? sellToken : buyToken

      const tokenAmount =
        tokenAmountSelected && Number(tokenAmountSelected.toExact()) > 1 ? tokenAmountSelected.toExact() : '1'

      order.sellAmount = parseUnits(tokenAmount, tokenSelected.decimals).toString()

      const cowQuote = await getQuote({
        chainId: activeChainId,
        signer,
        order: { ...order, expiresAt: dayjs().add(20, OrderExpiresInUnit.Minutes).unix() },
      })

      if (cowQuote) {
        const {
          quote: { buyAmount, sellAmount },
        } = cowQuote

        if (limitOrder.kind === Kind.Sell) {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            buy: formatMarketPrice(buyAmount, buyToken.decimals, tokenAmount),
          }))
        } else {
          setMarketPrices(marketPrice => ({
            ...marketPrice,
            sell: formatMarketPrice(sellAmount, sellToken.decimals, tokenAmount),
          }))
        }
      }
    }
  }, [protocol])

  return (
    <>
      <PageMetaData title="Limit Order | Swapr" />
      <AppBody>
        {protocol && (
          <LimitOrderProvider protocol={protocol}>
            <AutoColumn gap="12px">
              <AutoColumn gap="3px">
                <CurrencyInputPanel
                  id="limit-order-sell-currency"
                  value="0"
                  onUserInput={function (value: string): void {
                    throw new Error('Function not implemented.')
                  }}
                  showNativeCurrency={false}
                />
                <SwapTokens swapTokens={() => {}} loading={false} />
                <CurrencyInputPanel
                  id="limit-order-buy-currency"
                  value="0"
                  onUserInput={function (value: string): void {
                    throw new Error('Function not implemented.')
                  }}
                  showNativeCurrency={false}
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
                  <OrderExpiryField />
                </Flex>
              </AutoRow>
            </AutoColumn>
          </LimitOrderProvider>
        )}
      </AppBody>
    </>
  )
}
