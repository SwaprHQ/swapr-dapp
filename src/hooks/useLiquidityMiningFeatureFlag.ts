import { ChainId } from '@swapr/sdk'

import { useWeb3ReactCore } from './useWeb3ReactCore'

export function useLiquidityMiningFeatureFlag(): boolean {
  const { chainId } = useWeb3ReactCore()
  return (
    chainId === ChainId.RINKEBY ||
    chainId === ChainId.XDAI ||
    chainId === ChainId.MAINNET ||
    chainId === ChainId.ARBITRUM_RINKEBY ||
    chainId === ChainId.ARBITRUM_ONE
  )
}
