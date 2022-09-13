import { ChainId, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { AppState } from '../../../state'
import { AdapterKeys, Adapters } from '../advancedTradingView.types'
import { BaseAdapter } from './baseAdapter/base.adapter'
import { PairBurnsAndMints, PairSwaps } from './baseAdapter/base.types'
import { UniswapV3Adapter } from './uniswapV3/uniswapV3.adapter'
import { UniswapV3PairBurnsAndMints, UniswapV3PairSwaps } from './uniswapV3/uniswapV3.types'

export const adapters: Adapters<AppState> = {
  swapr: new BaseAdapter<AppState, PairSwaps, PairBurnsAndMints>({
    key: AdapterKeys.SWAPR,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SWAPR,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
    },
  }),
  sushiswap: new BaseAdapter<AppState, PairSwaps, PairBurnsAndMints>({
    key: AdapterKeys.SUSHISWAP,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SUSHISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange',
    },
  }),
  uniswapV2: new BaseAdapter<AppState, PairSwaps, PairBurnsAndMints>({
    key: AdapterKeys.UNISWAPV2,
    adapterSupportedChains: [ChainId.MAINNET],
    platform: UniswapV2RoutablePlatform.UNISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.GNOSIS]: '',
    },
  }),
  honeyswap: new BaseAdapter<AppState, PairSwaps, PairBurnsAndMints>({
    key: AdapterKeys.HONEYSWAP,
    adapterSupportedChains: [ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.HONEYSWAP,
    subgraphUrls: {
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/kirkins/honeyswap',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.MAINNET]: '',
    },
  }),
  uniswapV3: new UniswapV3Adapter<AppState, UniswapV3PairSwaps, UniswapV3PairBurnsAndMints>({
    key: AdapterKeys.UNISWAPV3,
    adapterSupportedChains: [ChainId.MAINNET],
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.GNOSIS]: '',
    },
  }),
}
