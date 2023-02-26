import { ChainId as SwaprChainId } from '@swapr/sdk'

import { ChainId } from '@lifi/sdk'

// // Add more chains keys on the go from
// //'https://li.quest/v1/chains';

export const LifiChainShortNames = new Map([
  [SwaprChainId.MAINNET, 'ETH'],
  [SwaprChainId.POLYGON, 'POL'],
  [SwaprChainId.GNOSIS, 'DAI'],
  [SwaprChainId.OPTIMISM_MAINNET, 'OPT'],
  [SwaprChainId.ARBITRUM_ONE, 'ARB'],
  [SwaprChainId.BSC_MAINNET, 'BSC'],
])

export function isLifiChainId(value: any): value is ChainId {
  return Object.values(ChainId).indexOf(value) > -1
}
