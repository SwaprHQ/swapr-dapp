import { ChainId, SWPR } from '@swapr/sdk'

// Includes chains on which swpr has its infrastructure
export type SWPRUnsupportedChains =
  | ChainId.POLYGON
  | ChainId.OPTIMISM_MAINNET
  | ChainId.OPTIMISM_GOERLI
  | ChainId.BSC_MAINNET
  | ChainId.BSC_TESTNET
export type SWPRSupportedChains = Exclude<ChainId, SWPRUnsupportedChains>

export const chainSupportsSWPR = (chainId?: ChainId) => {
  if (!chainId) return false
  return !!SWPR[chainId]
}
