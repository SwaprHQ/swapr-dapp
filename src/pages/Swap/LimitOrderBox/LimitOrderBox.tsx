import { redirect } from 'react-router-dom'

import { useActiveWeb3React } from '../../../hooks'

import { LimitOrderForm } from './components/LimitOrderForm/LimitOrderForm'
import { supportedChainIdList } from './constants'

export function LimitOrderBox() {
  const { provider, account, chainId } = useActiveWeb3React()

  if (chainId && !supportedChainIdList.includes(chainId)) {
    redirect('/swap')
    return null
  }

  if (!provider) {
    throw new Error('Limit Orders module requires a Web3 provider')
  }

  if (!chainId) {
    throw new Error('Should be connected to a network')
  }

  if (!account) {
    throw new Error('Limit Orders module requires an EVM account')
  }

  return <LimitOrderForm provider={provider} chainId={chainId} account={account} />
}
