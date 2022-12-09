import { ApolloClient, NormalizedCacheObject } from '@apollo/client'

import { carrotSubgraphClient } from '../apollo/client'
import { useWeb3ReactCore } from './useWeb3ReactCore'

export function useCarrotSubgraphClient(): ApolloClient<NormalizedCacheObject> | undefined {
  const { chainId } = useWeb3ReactCore()
  return chainId ? carrotSubgraphClient[chainId] : undefined
}
