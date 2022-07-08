import { ChainId } from '@swapr/sdk'

import { useWeb3React } from '@web3-react/core'

export function useLiquidityMiningFeatureFlag(): boolean {
  const { chainId } = useWeb3React()
  return (
    chainId === ChainId.RINKEBY ||
    chainId === ChainId.XDAI ||
    chainId === ChainId.MAINNET ||
    chainId === ChainId.ARBITRUM_RINKEBY ||
    chainId === ChainId.ARBITRUM_ONE
  )
}
