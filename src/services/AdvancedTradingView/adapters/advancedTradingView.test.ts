import { ChainId, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { combineReducers, configureStore } from '@reduxjs/toolkit'

import advancedTradingView, { actions } from '../advancedTradingView.reducer'
import { AdapterKeys, AdapterPayloadType } from '../advancedTradingView.types'
import { adapters } from './adapters.config'
import { AdvancedTradingViewAdapter } from './advancedTradingView.adapter'
import { BaseAdapter } from './baseAdapter/base.adapter'
import { PairSwaps } from './baseAdapter/base.types'

jest.mock('./baseAdapter/base.adapter')

const USDC_TOKEN = {
  address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  chainId: ChainId.MAINNET,
  decimals: 6,
  name: 'USDC Coin',
  symbol: 'USDC',
} as Token

const USDT_TOKEN = {
  chainId: ChainId.MAINNET,
  decimals: 6,
  name: 'Tether Coin',
  symbol: 'USDT',
  address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
} as Token

const adapterConstructorParams = {
  key: AdapterKeys.SWAPR,
  adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
  platform: UniswapV2RoutablePlatform.SWAPR,
  subgraphUrls: {
    [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
    [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
    [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
  },
}

const store = configureStore({
  reducer: combineReducers({ advancedTradingView }),
})

describe('AdvancedTradingView - adapter', () => {
  const advancedTradingViewAdapter = new AdvancedTradingViewAdapter({
    adapters,
    chainId: ChainId.MAINNET,
    store: store as any,
  })

  it('adapters store is empty before fetching data', () => {
    for (const adapterStore of Object.values(store.getState().advancedTradingView.adapters)) {
      expect(!Object.keys(adapterStore).length).toBeTruthy()
    }
  })

  it('isInitialized variable is equal to true after init method', () => {
    expect(advancedTradingViewAdapter.isInitialized).toBeFalsy()

    advancedTradingViewAdapter.init()

    expect(advancedTradingViewAdapter.isInitialized).toBeTruthy()
  })

  it('setPairToken function set tokens inside store', () => {
    expect(store.getState().advancedTradingView.pair.inputToken).toBe(undefined)
    expect(store.getState().advancedTradingView.pair.outputToken).toBe(undefined)

    advancedTradingViewAdapter.setPairTokens(USDC_TOKEN, USDT_TOKEN)

    expect(store.getState().advancedTradingView.pair.inputToken).toBe(USDC_TOKEN)
    expect(store.getState().advancedTradingView.pair.outputToken).toBe(USDT_TOKEN)
  })
})

describe('BaseAdapter - swapr', () => {
  it('check if adapter constructor was called', () => {
    expect(BaseAdapter).not.toHaveBeenCalled()

    new BaseAdapter(adapterConstructorParams)

    expect(BaseAdapter).toHaveBeenCalledTimes(1)
  })

  it('getPairTrades fetch data and push it to store', async () => {
    const baseAdapter = new BaseAdapter(adapterConstructorParams)

    const fakeSwapData = {
      id: '1',
      transaction: {
        id: '1',
      },
      amount0In: '10',
      amount1In: '0',
      amount0Out: '0',
      amount1Out: '5',
      amountUSD: '3',
      timestamp: Date.now().toString(),
    }

    const fakePairId = '0x123456789'

    jest.spyOn(baseAdapter, 'getPairTrades').mockImplementation(async () => {
      const data = await new Promise<PairSwaps>(resolve => {
        resolve({
          swaps: [fakeSwapData],
        })
      })

      store.dispatch(
        actions.setPairData({
          data: data.swaps,
          hasMore: true,
          key: AdapterKeys.SWAPR,
          pairId: fakePairId,
          payloadType: AdapterPayloadType.swaps,
        })
      )
    })

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    const pair = store.getState().advancedTradingView.adapters.swapr[fakePairId]

    expect(pair?.swaps?.hasMore).toBeTruthy()

    expect(pair?.swaps?.data[0]).toBe(fakeSwapData)
  })
})
