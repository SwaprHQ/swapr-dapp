import { redirect } from 'react-router-dom'

import { LimitOrderForm } from './components/LimitOrderForm/LimitOrderForm'
import { supportedChainIdList } from './constants'
import { useActiveWeb3React } from '../../../hooks'

export function LimitOrderBox() {
  const { library, account, chainId } = useActiveWeb3React()

  if (chainId && !supportedChainIdList.includes(chainId)) {
    redirect('/swap')
    return null
  }

  if (!library) {
    throw new Error('Limit Orders module requires a Web3 provider')
  }

  if (!chainId) {
    throw new Error('Should be connected to a network')
  }

  if (!account) {
    throw new Error('Limit Orders module requires an EVM account')
  }

  return <LimitOrderForm provider={library} chainId={chainId} account={account} />
}
