import { ChainId } from '@swapr/sdk'
import { getNetworkInfo } from '../../utils/networksList'

export type BridgeTabs = 'bridge' | 'collect' | 'history'

export const isNetworkDisabled = (optionChainId: ChainId, selectedNetworkChainId: ChainId) => {
  const { tag } = getNetworkInfo(optionChainId)
  return selectedNetworkChainId === optionChainId || tag === 'coming soon'
}
