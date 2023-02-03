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

export function proModeEventNameByChain(chainId?: ChainId): string {
  if (!chainId) return 'proMode/not-defined/15seconds'

  return {
    [ChainId.MAINNET]: 'proMode/ethereum/15seconds',
    [ChainId.GOERLI]: 'proMode/goerli/15seconds',
    [ChainId.GNOSIS]: 'proMode/gnosis/15seconds',
    [ChainId.RINKEBY]: 'proMode/rinkbey/15seconds',
    [ChainId.ARBITRUM_ONE]: 'proMode/arbitrum/15seconds',
    [ChainId.OPTIMISM_MAINNET]: 'proMode/optimism/15seconds',
    [ChainId.POLYGON]: 'proMode/polygon/15seconds',
    [ChainId.ARBITRUM_GOERLI]: 'proMode/arbitrum-goerli/15seconds',
    [ChainId.ARBITRUM_RINKEBY]: 'proMode/arbitrum-rinkeby/15seconds',
    [ChainId.BSC_MAINNET]: 'proMode/bsc/15seconds',
    [ChainId.BSC_TESTNET]: 'proMode/bsc-testnet/15seconds',
    [ChainId.OPTIMISM_MAINNET]: 'proMode/optimism/15seconds',
    [ChainId.OPTIMISM_GOERLI]: 'proMode/optimism-goerli/15seconds',
  }[chainId]
}
