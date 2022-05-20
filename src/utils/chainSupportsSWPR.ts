import { SWPR, ChainId } from '@swapr/sdk'

// Includes chains on which swpr has its infrastructure
export type SWPRUnsupportedChains = ChainId.POLYGON
export type SWPRSupportedChains = Exclude<ChainId, SWPRUnsupportedChains>

export const chainSupportsSWPR = (chainId?: ChainId) => {
  if (!chainId) return false
  return !!SWPR[chainId]
}
