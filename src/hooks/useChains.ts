import { useMemo } from 'react'

import { getChainPair } from '../utils/arbitrum'
import { useWeb3ReactCore } from './useWeb3ReactCore'

export const useChains = () => {
  const { chainId } = useWeb3ReactCore()
  return useMemo(() => getChainPair(chainId), [chainId])
}
