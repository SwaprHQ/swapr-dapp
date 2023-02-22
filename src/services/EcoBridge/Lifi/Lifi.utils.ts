import { ChainId } from '@swapr/sdk'

// Add more chains keys on the go from
//'https://li.quest/v1/chains';

export const LifiChainShortNames = new Map([
  [ChainId.MAINNET, 'ETH'],
  [ChainId.POLYGON, 'POL'],
  [ChainId.GNOSIS, 'DAI'],
  [ChainId.OPTIMISM_MAINNET, 'OPT'],
  [ChainId.ARBITRUM_ONE, 'ARB'],
  [ChainId.BSC_MAINNET, 'BSC'],
])
