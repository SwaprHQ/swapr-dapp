import { ChainId } from '@swapr/sdk'

export function getChainNameByChainId(chainId: ChainId): string {
  return {
    [ChainId.MAINNET]: 'ethereum',
    [ChainId.GOERLI]: 'goerli',
    [ChainId.GNOSIS]: 'gnosis',
    [ChainId.RINKEBY]: 'rinkeby',
    [ChainId.ARBITRUM_ONE]: 'arbitrum',
    [ChainId.OPTIMISM_MAINNET]: 'optimism',
    [ChainId.POLYGON]: 'polygon',
    [ChainId.ARBITRUM_GOERLI]: 'arbitrum-goerli',
    [ChainId.ARBITRUM_RINKEBY]: 'arbitrum-rinkeby',
    [ChainId.BSC_MAINNET]: 'bsc',
  }[chainId]
}
