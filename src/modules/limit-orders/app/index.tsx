import type { Web3Provider } from '@ethersproject/providers'
import type { ChainId } from '@swapr/sdk'

import { Form as LimitOrderForm } from '../components/Form'
import { supportedChainIdList } from '../constants'

export interface LimitOrderAppProps {
  provider: Web3Provider
  chainId: ChainId
  account: string
}

/**
 * The main entry point for the Limit Orders module.
 */
export function App(props: LimitOrderAppProps) {
  if (!props.provider) {
    throw new Error('Limit Orders module requires a Web3 provider')
  }

  if (!supportedChainIdList.includes(props.chainId)) {
    throw new Error('Limit Orders module does not support chainId ' + props.chainId)
  }

  if (!props.account) {
    throw new Error('Limit Orders module requires an EVM account')
  }

  return <LimitOrderForm {...props} />
}
