import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'

import { carrotSubgraphClient } from '../apollo/client'

export function useCarrotSubgraphClient(): ApolloClient<NormalizedCacheObject> | undefined {
  const { chainId } = useWeb3ReactCore()
  return chainId ? carrotSubgraphClient[chainId] : undefined
}
