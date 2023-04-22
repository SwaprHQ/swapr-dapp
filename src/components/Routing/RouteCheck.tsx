import { ChainId } from '@swapr/sdk'

import { useActiveWeb3React } from '../../hooks'
import { chainSupportsSWPR } from '../../utils/chainSupportsSWPR'

import { BaseRedirect } from './BaseRedirect'

/**
 * A Route that is only accessible if all features available: Swapr core contract are deployed on the chain
 */
export function RouteCheck({ element }: { element: JSX.Element }) {
  const { chainId } = useActiveWeb3React()
  // If all features are available, render the route
  if (chainSupportsSWPR(chainId) || ChainId.ARBITRUM_GOERLI === chainId) {
    // FIXME: fix this if's condition once SWPR is on Arb Goerli
    return element
  }
  return <BaseRedirect />
}
