import { ChainId, RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { AdapterKeys, Adapters } from '../advancedTradingView.types'
import { BaseAdapter } from './baseAdapter/base.adapter'
import { UniswapV3Adapter } from './uniswapV3/uniswapV3.adapter'

export const adapters: Adapters = {
  swapr: new BaseAdapter({
    key: AdapterKeys.SWAPR,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SWAPR,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
    },
  }),
  sushiswap: new BaseAdapter({
    key: AdapterKeys.SUSHISWAP,
    adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.SUSHISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange',
      [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange',
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange',
    },
  }),
  uniswapV2: new BaseAdapter({
    key: AdapterKeys.UNISWAPV2,
    adapterSupportedChains: [ChainId.MAINNET],
    platform: UniswapV2RoutablePlatform.UNISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.GNOSIS]: '',
    },
  }),
  honeyswap: new BaseAdapter({
    key: AdapterKeys.HONEYSWAP,
    adapterSupportedChains: [ChainId.GNOSIS],
    platform: UniswapV2RoutablePlatform.HONEYSWAP,
    subgraphUrls: {
      [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/kirkins/honeyswap',
      [ChainId.ARBITRUM_ONE]: '',
      [ChainId.MAINNET]: '',
    },
  }),
  uniswapV3: new UniswapV3Adapter({
    key: AdapterKeys.UNISWAPV3,
    adapterSupportedChains: [ChainId.MAINNET],
    platform: RoutablePlatform.UNISWAP,
    subgraphUrls: {
      [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
    },
  }),
}
