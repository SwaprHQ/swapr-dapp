import { useActiveWeb3React } from '../../../hooks'
import { App as LimitOrdersContainer } from './limit-orders'

export function LimitOrderBox() {
  const { library, account, chainId } = useActiveWeb3React()

  return <LimitOrdersContainer account={account} provider={library} chainId={chainId} />
}
