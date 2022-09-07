import { ChainId, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { configureStore, Store } from '@reduxjs/toolkit'
import { request as graphqlRequest } from 'graphql-request'

import advancedTradingView from '../../advancedTradingView.reducer'
import { selectCurrentSwaprPair } from '../../advancedTradingView.selectors'
import { AdapterKeys } from '../../advancedTradingView.types'
import { adapters } from '../adapters.config'
import { AdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { BaseAdapter, BaseAppState } from '../baseAdapter/base.adapter'

jest.mock('graphql-request')

const graphqlRequestMock = graphqlRequest as jest.Mock

const USDC_TOKEN = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const USDT_TOKEN = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')

const FAKE_SWAP_DATA = {
  id: '1',
  transaction: {
    id: '1',
  },
  amount0In: '10',
  amount1In: '0',
  amount0Out: '0',
  amount1Out: '5',
  amountUSD: '3',
  timestamp: '',
}

const FAKE_BURNS_AND_MINTS_DATA = {
  id: '1',
  transaction: {
    id: '1',
  },
  amount0: '10',
  amount1: '20',
  amountUSD: '5',
  timestamp: '',
}

const ADAPTER_CONSTRUCTOR_PARAMS = {
  key: AdapterKeys.SWAPR,
  adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
  platform: UniswapV2RoutablePlatform.SWAPR,
  subgraphUrls: {
    [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
    [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
    [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
  },
}

describe('AdvancedTradingView - adapters', () => {
  let store: Store<BaseAppState>
  let baseAdapter: BaseAdapter<BaseAppState>
  let advancedTradingViewAdapter: AdvancedTradingViewAdapter<BaseAppState>

  beforeEach(() => {
    store = configureStore({
      reducer: { advancedTradingView },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    })

    advancedTradingViewAdapter = new AdvancedTradingViewAdapter({
      adapters,
      chainId: ChainId.MAINNET,
      store,
    })

    baseAdapter = new BaseAdapter(ADAPTER_CONSTRUCTOR_PARAMS)

    baseAdapter.setInitialArguments({
      chainId: ChainId.MAINNET,
      store,
    })
  })

  afterAll(() => {
    jest.resetAllMocks()
  })

  it('advanced trading view store is empty on initial state and after chain change', async () => {
    expect(store.getState().advancedTradingView).toMatchSnapshot()

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        swaps: new Array(20).fill(FAKE_SWAP_DATA),
      })
    )

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    expect(store.getState().advancedTradingView).toMatchSnapshot()

    advancedTradingViewAdapter.updateActiveChainId(ChainId.ARBITRUM_ONE)

    expect(store.getState().advancedTradingView).toMatchSnapshot()
  })

  it('adapter sets pair tokens to store', () => {
    advancedTradingViewAdapter.setPairTokens(USDC_TOKEN, USDT_TOKEN)

    const { inputToken, outputToken } = store.getState().advancedTradingView.pair

    expect(inputToken).toBe(USDC_TOKEN)
    expect(outputToken).toBe(USDT_TOKEN)
  })

  it('isInitialized property is true after init method', () => {
    expect(advancedTradingViewAdapter.isInitialized).toBeFalsy()

    advancedTradingViewAdapter.init()

    expect(advancedTradingViewAdapter.isInitialized).toBeTruthy()
  })

  it('getPairTrades function fetches data and checks hasMore property', async () => {
    advancedTradingViewAdapter.setPairTokens(USDC_TOKEN, USDT_TOKEN)

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        swaps: new Array(50).fill(FAKE_SWAP_DATA),
      })
    )

    expect(graphqlRequestMock).toHaveBeenCalledTimes(0)

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(1)

    expect(store.getState().advancedTradingView).toMatchSnapshot()

    expect(selectCurrentSwaprPair(store.getState())?.pair?.swaps?.hasMore).toBeTruthy()

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        swaps: new Array(10).fill(FAKE_SWAP_DATA),
      })
    )

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(2)

    expect(store.getState().advancedTradingView).toMatchSnapshot()

    expect(selectCurrentSwaprPair(store.getState())?.pair?.swaps?.hasMore).toBeFalsy()

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(2)
  })

  it('getPairActivity function fetches and checks hasMore property', async () => {
    advancedTradingViewAdapter.setPairTokens(USDC_TOKEN, USDT_TOKEN)

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        burns: new Array(25).fill(FAKE_BURNS_AND_MINTS_DATA),
        mints: new Array(25).fill(FAKE_BURNS_AND_MINTS_DATA),
      })
    )

    expect(graphqlRequestMock).toHaveBeenCalledTimes(0)

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(1)

    expect(store.getState().advancedTradingView).toMatchSnapshot()

    expect(selectCurrentSwaprPair(store.getState())?.pair?.burnsAndMints?.hasMore).toBeTruthy()

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        burns: new Array(10).fill(FAKE_BURNS_AND_MINTS_DATA),
        mints: new Array(10).fill(FAKE_BURNS_AND_MINTS_DATA),
      })
    )

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(2)

    expect(store.getState().advancedTradingView).toMatchSnapshot()

    expect(selectCurrentSwaprPair(store.getState())?.pair?.burnsAndMints?.hasMore).toBeFalsy()

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequest).toHaveBeenCalledTimes(2)
  })
})
