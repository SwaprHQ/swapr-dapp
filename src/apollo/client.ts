import { ChainId } from '@swapr/sdk'

import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { GraphQLClient } from 'graphql-request'

import { SWPRSupportedChains } from '../utils/chainSupportsSWPR'

/**
 * We use these subgraphs fo fetch Swapr pools related data.
 * Use an empty string if there's no pool for the added chain.
 */
export const subgraphClientsUris: { [chainId in SWPRSupportedChains]: string } = {
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-rinkeby-v2',
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
  [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-goerli',
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-rinkeby',
  [ChainId.SCROLL_MAINNET]: '',
  [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
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
  [ChainId.ARBITRUM_GOERLI]: setupApolloClient(ChainId.ARBITRUM_GOERLI), // FIXME: fix this once the subgraph is deployed
  [ChainId.ARBITRUM_ONE]: setupApolloClient(ChainId.ARBITRUM_ONE),
  [ChainId.ARBITRUM_RINKEBY]: setupApolloClient(ChainId.ARBITRUM_RINKEBY),
  [ChainId.GOERLI]: setupApolloClient(ChainId.GOERLI),
  [ChainId.MAINNET]: defaultSubgraphClient,
  [ChainId.RINKEBY]: setupApolloClient(ChainId.RINKEBY),
  [ChainId.SCROLL_MAINNET]: setupApolloClient(ChainId.SCROLL_MAINNET), // FIXME: fix this once the subgraph is deployed
  [ChainId.XDAI]: setupApolloClient(ChainId.XDAI),
}

export const immediateSubgraphClients: { [chainId in SWPRSupportedChains]: GraphQLClient } = {
  [ChainId.ARBITRUM_GOERLI]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_GOERLI]), // FIXME: fix this once the subgraph is deployed
  [ChainId.ARBITRUM_ONE]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_ONE]),
  [ChainId.ARBITRUM_RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.ARBITRUM_RINKEBY]),
  [ChainId.GOERLI]: new GraphQLClient(subgraphClientsUris[ChainId.GOERLI]),
  [ChainId.MAINNET]: new GraphQLClient(subgraphClientsUris[ChainId.MAINNET]),
  [ChainId.RINKEBY]: new GraphQLClient(subgraphClientsUris[ChainId.RINKEBY]),
  [ChainId.SCROLL_MAINNET]: new GraphQLClient(subgraphClientsUris[ChainId.SCROLL_MAINNET]), // FIXME: fix this once the subgraph is deployed
  [ChainId.XDAI]: new GraphQLClient(subgraphClientsUris[ChainId.XDAI]),
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
  [ChainId.ARBITRUM_GOERLI]: '', // FIXME: fix this once the subgraph is deployed
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dodoex/arbitrum-one-blocks',
  [ChainId.ARBITRUM_RINKEBY]: 'https://api.thegraph.com/subgraphs/name/dodoex/arbitrum-one-blocks',
  [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/1hive/xdai-blocks',
  [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.RINKEBY]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks',
  [ChainId.SCROLL_MAINNET]: '', // FIXME: fix this once the subgraph is deployed
}

export const subgraphPriceClientsUris: { [chainId: number]: string } = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-price-mainnet',
  [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-price-arbitrum-on',
  [ChainId.XDAI]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-price-xdai',
}

const setupBlocksApolloClient = (network: SWPRSupportedChains) =>
  new ApolloClient({
    uri: subgraphBlocksClientsUris[network],
    cache: new InMemoryCache(),
  })

export const subgraphBlocksClients: {
  [chainId in SWPRSupportedChains]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.ARBITRUM_GOERLI]: setupBlocksApolloClient(ChainId.ARBITRUM_GOERLI), // FIXME: fix this once the subgraph is deployed
  [ChainId.ARBITRUM_RINKEBY]: setupBlocksApolloClient(ChainId.ARBITRUM_RINKEBY),
  [ChainId.ARBITRUM_ONE]: setupBlocksApolloClient(ChainId.ARBITRUM_ONE),
  [ChainId.GOERLI]: setupBlocksApolloClient(ChainId.GOERLI),
  [ChainId.MAINNET]: setupBlocksApolloClient(ChainId.MAINNET),
  [ChainId.RINKEBY]: setupBlocksApolloClient(ChainId.RINKEBY),
  [ChainId.SCROLL_MAINNET]: setupBlocksApolloClient(ChainId.SCROLL_MAINNET), // FIXME: fix this once the subgraph is deployed
  [ChainId.XDAI]: setupBlocksApolloClient(ChainId.XDAI),
}

const setupBaseApolloClient = (uri: string) =>
  new ApolloClient({
    uri,
    cache: new InMemoryCache(),
  })

const setupPriceApolloClient = (network: number) => setupBaseApolloClient(subgraphPriceClientsUris[network])

export const subgraphPriceClients: {
  [chainId: number]: ApolloClient<NormalizedCacheObject>
} = {
  [ChainId.MAINNET]: setupPriceApolloClient(ChainId.MAINNET),
  [ChainId.XDAI]: setupPriceApolloClient(ChainId.XDAI),
  [ChainId.ARBITRUM_ONE]: setupPriceApolloClient(ChainId.ARBITRUM_ONE),
}
