import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import { useMemo } from 'react'

import { getChainPair } from '../utils/arbitrum'

export const useChains = () => {
  const { chainId } = useWeb3ReactCore()
  return useMemo(() => getChainPair(chainId), [chainId])
}
