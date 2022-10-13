import type { Web3Provider } from '@ethersproject/providers'
import type { ChainId } from '@swapr/sdk'

import { LimitOrderForm } from '../components/Form'
import { OrderList } from '../components/OrderList'
import { supportedChainIdList } from '../constants'

export interface LimitOrderAppProps {
  provider?: Web3Provider
  chainId?: ChainId
  account?: string | null
}

/**
 * The main entry point for the Limit Orders module.
 */
export function App({ provider, chainId, account }: LimitOrderAppProps) {
  if (!provider) {
    throw new Error('Limit Orders module requires a Web3 provider')
  }

  if (!chainId) {
    throw new Error('Should be connected to a network')
  }

  if (chainId && !supportedChainIdList.includes(chainId)) {
    throw new Error('Limit Orders module does not support chainId ' + chainId)
  }

  if (!account) {
    throw new Error('Limit Orders module requires an EVM account')
  }

  return (
    <>
      <LimitOrderForm provider={provider} chainId={chainId} account={account} />
      <OrderList />
    </>
  )
}
