import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { useWeb3React } from '@web3-react/core'

import { carrotSubgraphClient } from '../apollo/client'

export function useCarrotSubgraphClient(): ApolloClient<NormalizedCacheObject> | undefined {
  const { chainId } = useWeb3React()
  return chainId ? carrotSubgraphClient[chainId] : undefined
}
