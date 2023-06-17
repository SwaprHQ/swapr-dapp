import { useEffect, useRef, useState } from 'react'
import { Flex } from 'rebass'

import { AutoColumn } from '../../../components/Column'
import { CurrencyInputPanel } from '../../../components/CurrencyInputPanel'
import { PageMetaData } from '../../../components/PageMetaData'
import { useActiveWeb3React } from '../../../hooks'
import LimitOrder, { Kind, LimitOrderChangeHandler, MarketPrices } from '../../../services/LimitOrders'
import { LimitOrderProvider } from '../../../services/LimitOrders/LimitOrder.provider'
import AppBody from '../../AppBody'

import { AutoRow } from './Components/AutoRow'
import { OrderExpiryField } from './Components/OrderExpiryField'
import { OrderLimitPriceField } from './Components/OrderLimitPriceField'
import SwapTokens from './Components/SwapTokens'

export default function LimitOrderUI() {
  const limitSdk = useRef(new LimitOrder()).current

  const { chainId, account, library } = useActiveWeb3React()

  const [protocol, setProtocol] = useState(limitSdk.getActiveProtocol())
  const [fetchMarketPrice, setFetchMarketPrice] = useState<boolean>(true)

  useEffect(() => {
    async function updateSigner(signerData: LimitOrderChangeHandler) {
      await limitSdk.updateSigner(signerData)
      setProtocol(limitSdk.getActiveProtocol())
    }
    if (chainId && account && library) {
      updateSigner({ activeChainId: chainId, account, activeProvider: library })
    }
  }, [account, chainId, library, limitSdk])

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
                  onUserInput={function (_value: string): void {
                    throw new Error('Function not implemented.')
                  }}
                  showNativeCurrency={false}
                />
                <SwapTokens swapTokens={() => {}} loading={false} />
                <CurrencyInputPanel
                  id="limit-order-buy-currency"
                  value="0"
                  onUserInput={function (_value: string): void {
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
