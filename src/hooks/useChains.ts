import { useMemo } from 'react'

import { getChainPair } from '../utils/arbitrum'

import { useActiveWeb3React } from '.'

export const useChains = () => {
  const { chainId } = useActiveWeb3React()
  return useMemo(() => getChainPair(chainId), [chainId])
}
