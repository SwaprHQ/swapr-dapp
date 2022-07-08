import { useWeb3React } from '@web3-react/core'
import { useMemo } from 'react'

import { getChainPair } from '../utils/arbitrum'

export const useChains = () => {
  const { chainId } = useWeb3React()
  return useMemo(() => getChainPair(chainId), [chainId])
}
