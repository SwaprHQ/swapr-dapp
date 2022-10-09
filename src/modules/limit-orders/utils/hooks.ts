import { ChainId } from '@swapr/sdk'

import { OrderMetaData } from '@cowprotocol/cow-sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import { useListsByAddress } from '../../../state/lists/hooks'
import { getOwnerOrders } from '../api'

interface LimitToken {
  value: number
  symbol?: string
  tokenAddress: string
}

export interface LimitOrderTransaction extends Omit<OrderMetaData, 'status' | 'sellToken' | 'buyToken'> {
  type: 'Limit Order'
  hash: string
  network: ChainId
  sellToken: LimitToken
  buyToken: LimitToken
  confirmedTime: number
  status: OrderMetaData['status'] | 'pending'
}

export const useLimitOrderTransactions = (chainId?: ChainId, account?: string | null) => {
  const [orders, setOrders] = useState<LimitOrderTransaction[]>([])
  const listByAddress = useListsByAddress()

  useEffect(() => {
    const getOrders = async (chainId: ChainId, account: string) => {
      const orders = await getOwnerOrders(chainId, account)
      console.log({ orders })
      if (orders && orders.length > 0) {
        setOrders(
          orders.map(order => {
            const sellToken = listByAddress.get(100)?.get(order.sellToken)
            const buyToken = listByAddress.get(100)?.get(order.buyToken)
            return {
              ...order,
              type: 'Limit Order',
              hash: order.uid,
              network: 100,
              sellToken: {
                value: formatUnits(order.sellAmount, sellToken?.decimals) as unknown as number,
                symbol: sellToken?.symbol,
                tokenAddress: order.sellToken,
              },
              buyToken: {
                value: formatUnits(order.buyAmount, buyToken?.decimals) as unknown as number,
                symbol: buyToken?.symbol,
                tokenAddress: order.buyToken,
              },
              confirmedTime: order.validTo * 1000,
              status: order.status === 'open' ? 'pending' : order.status,
            }
          })
        )
      }
    }
    if (account != null && chainId) {
      getOrders(chainId, account)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId])

  return orders
}
