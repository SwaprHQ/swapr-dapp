import { ChainId } from '@swapr/sdk'

import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { GraphQLClient } from 'graphql-request'

import { SWPRSupportedChains } from '../utils/chainSupportsSWPR'

export const subgraphClientsUris: { [chainId in SWPRSupportedChains]: string } = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
  [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
  [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-goerli',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-rinkeby-v2',
  [ChainId.ARBITRUM_GOERLI]: '', // FIXME: fix this once the subgraph is deployed
}

const setupApolloClient = (network: SWPRSupportedChains) =>
  new ApolloClient({
    uri: subgraphClientsUris[network],
    cache: new InMemoryCache(),
  })

export const defaultSubgraphClient = setupApolloClient(ChainId.MAINNET)

export const subgraphClients: {
  [chainId in SWPRSupportedChains]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.MAINNET]: defaultSubgraphClient,
  [ChainId.XDAI]: setupApolloClient(ChainId.XDAI),
  [ChainId.ARBITRUM_ONE]: setupApolloClient(ChainId.ARBITRUM_ONE),
  // testnets
  [ChainId.RINKEBY]: setupApolloClient(ChainId.RINKEBY),
  [ChainId.GOERLI]: setupApolloClient(ChainId.GOERLI),
  [ChainId.ARBITRUM_RINKEBY]: setupApolloClient(ChainId.ARBITRUM_RINKEBY),
  [ChainId.ARBITRUM_GOERLI]: setupApolloClient(ChainId.ARBITRUM_GOERLI), // FIXME: fix this once the subgraph is deployed
}

export const immediateSubgraphClients: { [chainId in SWPRSupportedChains]: GraphQLClient } = {
  [ChainId.MAINNET]: new GraphQLClient(subgraphClientsUris[ChainId.MAINNET]),
  [ChainId.RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.RINKEBY]),
  [ChainId.GOERLI]: new GraphQLClient(subgraphClientsUris[ChainId.GOERLI]),
  [ChainId.XDAI]: new GraphQLClient(subgraphClientsUris[ChainId.XDAI]),
  [ChainId.ARBITRUM_ONE]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_ONE]),
  [ChainId.ARBITRUM_RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_RINKEBY]),
  [ChainId.ARBITRUM_GOERLI]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_GOERLI]), // FIXME: fix this once the subgraph is deployed
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
  [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks',
  // testnests
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dodoex/arbitrum-one-blocks',
  [ChainId.ARBITRUM_GOERLI]: '', // FIXME: fix this once the subgraph is deployed
}

const setupBlocksApolloClient = (network: SWPRSupportedChains) =>
  new ApolloClient({
    uri: subgraphBlocksClientsUris[network],
    cache: new InMemoryCache(),
  })

export const subgraphBlocksClients: {
  [chainId in SWPRSupportedChains]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.MAINNET]: setupBlocksApolloClient(ChainId.MAINNET),
  [ChainId.XDAI]: setupBlocksApolloClient(ChainId.XDAI),
  [ChainId.ARBITRUM_ONE]: setupBlocksApolloClient(ChainId.ARBITRUM_ONE),
  // testnets
  [ChainId.RINKEBY]: setupBlocksApolloClient(ChainId.RINKEBY),
  [ChainId.GOERLI]: setupBlocksApolloClient(ChainId.GOERLI),
  [ChainId.ARBITRUM_RINKEBY]: setupBlocksApolloClient(ChainId.ARBITRUM_RINKEBY),
  [ChainId.ARBITRUM_GOERLI]: setupBlocksApolloClient(ChainId.ARBITRUM_GOERLI), // FIXME: fix this once the subgraph is deployed
}
