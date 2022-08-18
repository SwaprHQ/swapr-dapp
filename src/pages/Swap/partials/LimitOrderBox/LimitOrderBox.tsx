import type { Web3Provider } from '@ethersproject/providers'

import { useActiveWeb3React } from '../../../../hooks'
import { App as LimitOrdersContainer } from '../../../../modules/limit-orders'

export function LimitOrderBox() {
  const { library, account, chainId } = useActiveWeb3React()

  return (
    <LimitOrdersContainer account={account as string} provider={library as Web3Provider} chainId={chainId as number} />
  )
}
