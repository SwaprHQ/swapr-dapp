import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { OrderMetaData } from '@cowprotocol/cow-sdk'
import { formatUnits } from 'ethers/lib/utils'
import { useEffect, useState } from 'react'

import { useListsByAddress } from '../../../../state/lists/hooks'
import { deleteOpenOrders, getOwnerOrders } from '../api'

const appDataHashes = {
  [ChainId.GNOSIS]: '0x6c240279a61e99270495394a46ace74065b511f8d3e6899f8ce87bbaefab21de',
  [ChainId.MAINNET]: '0x7bb480cf9d89cd9fa5ac557f573fa3cee96ca57ec0b9a0de783a29391967c4ab',
}

interface Token {
  value: number
  symbol?: string
  chainId?: ChainId
  tokenAddress: string
}

export interface LimitOrderTransaction extends Omit<OrderMetaData, 'status' | 'sellToken' | 'buyToken'> {
  type: 'Limit Order'
  hash: string
  network: ChainId
  sellToken: Token
  buyToken: Token
  confirmedTime: number
  status: OrderMetaData['status']
  cancelOrder: ((uid: string, provider: Web3Provider) => Promise<boolean>) | undefined
}

export const useLimitOrderTransactions = (chainId?: ChainId, account?: string | null, allNetworks = false) => {
  const [orders, setOrders] = useState<LimitOrderTransaction[]>([])
  const listByAddress = useListsByAddress()

  useEffect(() => {
    const getLimitOrderTransactions = async (chainId: ChainId, account: string) => {
      const orders = await getOrders(account, allNetworks, chainId)
      if (orders && orders.length > 0) {
        //@ts-expect-error  chainId here wont have other networks since its filtered in upper scope
        const appData = allNetworks ? Object.values(appDataHashes) : [appDataHashes[chainId]]
        const filteredOrders = orders.filter(order => appData.includes(order.appData.toString()))
        const formattedLimitOrders = filteredOrders.map(order => {
          const sellToken = listByAddress.get(chainId)?.get(order.sellToken)
          const buyToken = listByAddress.get(chainId)?.get(order.buyToken)
          return {
            ...order,
            type: 'Limit Order' as const,
            hash: order.uid,
            network: getNetworkId(order.appData.toString()),
            sellToken: {
              value: formatUnits(order.sellAmount, sellToken?.decimals) as unknown as number,
              symbol: sellToken?.symbol,
              tokenAddress: order.sellToken,
              chainId: getNetworkId(order.appData.toString()),
            },
            buyToken: {
              value: formatUnits(order.buyAmount, buyToken?.decimals) as unknown as number,
              symbol: buyToken?.symbol,
              tokenAddress: order.buyToken,
              chainId: getNetworkId(order.appData.toString()),
            },
            confirmedTime: order.validTo * 1000,
            status: order.status,
            cancelOrder: cancelOpenOrder(order.status, chainId, () => getLimitOrderTransactions(chainId, account)),
          }
        })
        setOrders(formattedLimitOrders)
      }
    }
    if (account != null && chainId !== undefined) {
      getLimitOrderTransactions(chainId, account)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, chainId, allNetworks])

  return orders
}

function cancelOpenOrder(status: OrderMetaData['status'], chainId: ChainId, updateLimitOrderTransactions: () => void) {
  if (status === 'open') {
    return async (uid: string, provider: Web3Provider) => {
      const signer = provider.getSigner()
      // Cancel an open order
      await deleteOpenOrders(chainId, uid, signer)
      // Refetch orders
      await updateLimitOrderTransactions()
      return true
    }
  }
}

function getNetworkId(appData: string) {
  return Object.keys(appDataHashes)
    .map(Number)
    .find((key: keyof typeof appDataHashes) => appDataHashes[key] === appData) as number
}

async function getOrders(account: string, allNetworks: boolean, chainId: ChainId) {
  if (allNetworks) {
    const allOrders = await Promise.all([
      getOwnerOrders(ChainId.GNOSIS, account),
      getOwnerOrders(ChainId.MAINNET, account),
    ]).catch(error => {
      console.error({ error, message: 'All limit order fetch failed' })
      return [[]]
    })
    return allOrders.flat()
  }
  if (chainId === ChainId.GNOSIS || chainId === ChainId.MAINNET) {
    return await getOwnerOrders(chainId, account)
  }
  return [] as OrderMetaData[]
}
