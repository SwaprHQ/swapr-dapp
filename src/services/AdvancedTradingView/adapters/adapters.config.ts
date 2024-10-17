import { ChainId, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { AppState } from '../../../state'
import { AdapterKey, Adapters } from '../advancedTradingView.types'

import { BaseAdapter } from './baseAdapter/base.adapter'
import { PairBurnsAndMints, PairSwaps, PairSwapsBurnsAndMints } from './baseAdapter/base.types'
import { UniswapV3Adapter } from './uniswapV3/uniswapV3.adapter'
import {
  UniswapV3PairBurnsAndMints,
  UniswapV3PairSwaps,
  UniswapV3SwapsBurnsAndMints,
} from './uniswapV3/uniswapV3.types'

const SUBGRAPH_API_KEY = '5f28b2eb91e916650da7ffe9bd228774'

export const adapters: Adapters<AppState> = {
  swapr: new BaseAdapter<AppState, PairSwapsBurnsAndMints, PairSwaps, PairBurnsAndMints>({
    key: AdapterKey.SWAPR,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SWAPR,
    subgraphUrls: {
      [ChainId.MAINNET]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/DQApa5vhVyx1sajkrF8zEFmLJTYyyMyw8WdiYt5hw9Fn`,
      [ChainId.ARBITRUM_ONE]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/H2EYoeTL5qDNeUeFecReCBvEq6BPCx4EnEDoAv7UTyL5`,
      [ChainId.GNOSIS]: `https://gateway-arbitrum.network.thegraph.com/api/${SUBGRAPH_API_KEY}/subgraphs/id/EWoa3JwNntAWtaLsLixTU25smp4R5tzGvs9rFXx9NHKZ`,
      [ChainId.POLYGON]: '',
      [ChainId.OPTIMISM_MAINNET]: '',
    },
  }),
  sushiswap: new BaseAdapter<AppState, PairSwapsBurnsAndMints, PairSwaps, PairBurnsAndMints>({
    key: AdapterKey.SUSHISWAP,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SUSHISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange',
      [ChainId.POLYGON]: '',
      [ChainId.OPTIMISM_MAINNET]: '',
    },
  }),
  uniswapV2: new BaseAdapter<AppState, PairSwapsBurnsAndMints, PairSwaps, PairBurnsAndMints>({
    key: AdapterKey.UNISWAPV2,
    adapterSupportedChains: [ChainId.MAINNET],
    platform: UniswapV2RoutablePlatform.UNISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.GNOSIS]: '',
      [ChainId.POLYGON]: '',
      [ChainId.OPTIMISM_MAINNET]: '',
    },
  }),
  honeyswap: new BaseAdapter<AppState, PairSwapsBurnsAndMints, PairSwaps, PairBurnsAndMints>({
    key: AdapterKey.HONEYSWAP,
    adapterSupportedChains: [ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.HONEYSWAP,
    subgraphUrls: {
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/kirkins/honeyswap',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.MAINNET]: '',
      [ChainId.POLYGON]: '',
      [ChainId.OPTIMISM_MAINNET]: '',
    },
  }),
  uniswapV3: new UniswapV3Adapter<
    AppState,
    UniswapV3SwapsBurnsAndMints,
    UniswapV3PairSwaps,
    UniswapV3PairBurnsAndMints
  >({
    key: AdapterKey.UNISWAPV3,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.POLYGON, ChainId.OPTIMISM_MAINNET],
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev',
      [ChainId.GNOSIS]: '',
      [ChainId.POLYGON]: 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon',
      [ChainId.OPTIMISM_MAINNET]: 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis',
    },
  }),
}
