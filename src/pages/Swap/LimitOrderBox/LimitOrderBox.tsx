import { useActiveWeb3React } from '../../../hooks'
import { LimitOrderForm } from './components/LimitOrderForm'
import { supportedChainIdList } from './constants'

export function LimitOrderBox() {
  const { library, account, chainId } = useActiveWeb3React()

  if (!library) {
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

  return <LimitOrderForm provider={library} chainId={chainId} account={account} />
}
