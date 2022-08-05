import { ChainId } from '@swapr/sdk'

import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { GraphQLClient } from 'graphql-request'

import { SWPRSupportedChains } from '../utils/chainSupportsSWPR'

export const subgraphClientsUris: { [chainId in SWPRSupportedChains]: string } = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
  [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-rinkeby-v2',
}

export const defaultSubgraphClient = new ApolloClient({
  uri: subgraphClientsUris[ChainId.MAINNET],
  cache: new InMemoryCache(),
})

export const subgraphClients: {
  [chainId in SWPRSupportedChains]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.MAINNET]: defaultSubgraphClient,
  [ChainId.RINKEBY]: new ApolloClient({
    uri: subgraphClientsUris[ChainId.RINKEBY],
    cache: new InMemoryCache(),
  }),
  [ChainId.XDAI]: new ApolloClient({
    uri: subgraphClientsUris[ChainId.XDAI],
    cache: new InMemoryCache(),
  }),
  [ChainId.ARBITRUM_ONE]: new ApolloClient({
    uri: subgraphClientsUris[ChainId.ARBITRUM_ONE],
    cache: new InMemoryCache(),
  }),
  [ChainId.ARBITRUM_RINKEBY]: new ApolloClient({
    uri: subgraphClientsUris[ChainId.ARBITRUM_RINKEBY],
    cache: new InMemoryCache(),
  }),
}

export const immediateSubgraphClients: { [chainId in SWPRSupportedChains]: GraphQLClient } = {
  [ChainId.MAINNET]: new GraphQLClient(subgraphClientsUris[ChainId.MAINNET]),
  [ChainId.RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.RINKEBY]),
  [ChainId.XDAI]: new GraphQLClient(subgraphClientsUris[ChainId.XDAI]),
  [ChainId.ARBITRUM_ONE]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_ONE]),
  [ChainId.ARBITRUM_RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_RINKEBY]),
}

export const immediateCarrotSubgraphClients: { [chainId: number]: GraphQLClient } = {
  [ChainId.RINKEBY]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/luzzif/carrot-rinkeby'),
  [ChainId.XDAI]: new GraphQLClient('https://api.thegraph.com/subgraphs/name/luzzif/carrot-xdai'),
}

export const carrotSubgraphClient: { [chainId: number]: ApolloClient<NormalizedCacheObject> } = {
  [ChainId.RINKEBY]: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/luzzif/carrot-rinkeby',
    cache: new InMemoryCache(),
  }),
  [ChainId.XDAI]: new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/luzzif/carrot-xdai',
    cache: new InMemoryCache(),
  }),
}

export const subgraphBlocksClientsUris: { [chainId in SWPRSupportedChains]: string } = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dodoex/arbitrum-one-blocks',
  [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks',
  // testnests
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dodoex/arbitrum-one-blocks',
}

export const subgraphBlocksClients: {
  [chainId in SWPRSupportedChains]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.MAINNET]: new ApolloClient({
    uri: subgraphBlocksClientsUris[ChainId.MAINNET],
    cache: new InMemoryCache(),
  }),
  [ChainId.RINKEBY]: new ApolloClient({
    uri: subgraphBlocksClientsUris[ChainId.RINKEBY],
    cache: new InMemoryCache(),
  }),
  [ChainId.XDAI]: new ApolloClient({
    uri: subgraphBlocksClientsUris[ChainId.XDAI],
    cache: new InMemoryCache(),
  }),
  [ChainId.ARBITRUM_ONE]: new ApolloClient({
    uri: subgraphBlocksClientsUris[ChainId.ARBITRUM_ONE],
    cache: new InMemoryCache(),
  }),
  [ChainId.ARBITRUM_RINKEBY]: new ApolloClient({
    uri: subgraphBlocksClientsUris[ChainId.ARBITRUM_RINKEBY],
    cache: new InMemoryCache(),
  }),
}
