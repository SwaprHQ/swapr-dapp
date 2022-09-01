import { ChainId } from '@swapr/sdk'

import { useActiveWeb3React } from './index'

export function useLiquidityMiningFeatureFlag(): boolean {
  const { chainId } = useActiveWeb3React()
  return (
    chainId === ChainId.RINKEBY ||
    chainId === ChainId.XDAI ||
    chainId === ChainId.MAINNET ||
    chainId === ChainId.ARBITRUM_RINKEBY ||
    chainId === ChainId.ARBITRUM_ONE
  )
}
