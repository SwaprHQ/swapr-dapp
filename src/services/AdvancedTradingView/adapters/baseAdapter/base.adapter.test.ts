import { ChainId, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { configureStore, Store } from '@reduxjs/toolkit'
import { request as graphqlRequest } from 'graphql-request'

import { AdapterKey } from '../../advancedTradingView.types'
import advancedTradingView, { actions } from '../../store/advancedTradingView.reducer'
import { selectCurrentSwaprPair } from '../../store/advancedTradingView.selectors'
import { BaseAdapter, BaseAppState } from './base.adapter'
import { PairBurnsAndMints, PairSwaps } from './base.types'

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

const USDC_TOKEN = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const USDT_TOKEN = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')

jest.mock('graphql-request')

const graphqlRequestMock = graphqlRequest as jest.Mock

describe('BaseAdapter', () => {
  let store: Store<BaseAppState>
  let baseAdapter: BaseAdapter<BaseAppState, PairSwaps, PairBurnsAndMints>

  beforeEach(() => {
    store = configureStore({
      reducer: { advancedTradingView },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    })

    baseAdapter = new BaseAdapter({
      key: AdapterKey.SWAPR,
      adapterSupportedChains: [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS],
      platform: UniswapV2RoutablePlatform.SWAPR,
      subgraphUrls: {
        [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-mainnet-v2',
        [ChainId.ARBITRUM_ONE]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-arbitrum-one-v3',
        [ChainId.GNOSIS]: 'https://api.thegraph.com/subgraphs/name/dxgraphs/swapr-xdai-v2',
        [ChainId.POLYGON]: '',
        [ChainId.OPTIMISM_MAINNET]: '',
      },
    })

    baseAdapter.setInitialArguments({
      chainId: ChainId.MAINNET,
      store,
    })

    store.dispatch(actions.setPairTokens({ inputToken: USDC_TOKEN, outputToken: USDT_TOKEN }))
  })

  it('getPairTrades function fetches data and checks hasMore property', async () => {
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

    expect(graphqlRequestMock).toHaveBeenCalledTimes(1)

    const pairAfterFirstFetch = selectCurrentSwaprPair(store.getState())?.pair

    expect(pairAfterFirstFetch?.swaps?.data.length).toBe(50)

    expect(pairAfterFirstFetch?.swaps?.hasMore).toBeTruthy()

    expect(pairAfterFirstFetch?.swaps?.data).toEqual(new Array(50).fill(FAKE_SWAP_DATA))

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

    const pairAfterSecondFetch = selectCurrentSwaprPair(store.getState())?.pair

    expect(pairAfterSecondFetch?.swaps?.data.length).toBe(60)

    expect(pairAfterSecondFetch?.swaps?.hasMore).toBeFalsy()

    expect(pairAfterSecondFetch?.swaps?.data).toEqual(new Array(60).fill(FAKE_SWAP_DATA))

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequestMock).toHaveBeenCalledTimes(2)
  })

  it('getPairActivity function fetches and checks hasMore property', async () => {
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

    expect(graphqlRequestMock).toHaveBeenCalledTimes(1)

    const pairAfterFirstFetch = selectCurrentSwaprPair(store.getState())?.pair

    expect(pairAfterFirstFetch?.burnsAndMints?.data.length).toBe(50)

    expect(pairAfterFirstFetch?.burnsAndMints?.hasMore).toBeTruthy()

    expect(pairAfterFirstFetch?.burnsAndMints?.data).toEqual(new Array(50).fill(FAKE_BURNS_AND_MINTS_DATA))

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

    expect(graphqlRequestMock).toHaveBeenCalledTimes(2)

    const pairAfterSecondFetch = selectCurrentSwaprPair(store.getState())?.pair

    expect(pairAfterSecondFetch?.burnsAndMints?.data.length).toBe(70)

    expect(pairAfterSecondFetch?.burnsAndMints?.hasMore).toBeFalsy()

    expect(pairAfterSecondFetch?.burnsAndMints?.data).toEqual(new Array(70).fill(FAKE_BURNS_AND_MINTS_DATA))

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: false,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(graphqlRequestMock).toHaveBeenCalledTimes(2)
  })
  it("adapter doesn't update store when fetch fails (subgraph is down)", async () => {
    graphqlRequestMock.mockImplementation(() => Promise.reject())

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(store.getState().advancedTradingView.adapters).toMatchInlineSnapshot(`
      Object {
        "honeyswap": Object {},
        "sushiswap": Object {},
        "swapr": Object {},
        "uniswapV2": Object {},
        "uniswapV3": Object {},
      }
    `)
  })

  it('adapters sets hasMore to false when response is empty array (incorrect pairId)', async () => {
    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        swaps: [],
      })
    )

    await baseAdapter.getPairTrades({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 50,
      abortController: () => new AbortController().signal,
    })

    graphqlRequestMock.mockImplementationOnce(() =>
      Promise.resolve({
        burns: [],
        mints: [],
      })
    )

    await baseAdapter.getPairActivity({
      inputToken: USDC_TOKEN,
      outputToken: USDT_TOKEN,
      isFirstFetch: true,
      amountToFetch: 25,
      abortController: () => new AbortController().signal,
    })

    expect(selectCurrentSwaprPair(store.getState())?.pair?.swaps?.hasMore).toBeFalsy()
    expect(selectCurrentSwaprPair(store.getState())?.pair?.burnsAndMints?.hasMore).toBeFalsy()
  })

  it('isSupportedChainId works correctly', () => {
    // base adapter supported chains [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS]
    expect(baseAdapter.isSupportedChainId(ChainId.MAINNET)).toBeTruthy()
    expect(baseAdapter.isSupportedChainId(ChainId.ARBITRUM_ONE)).toBeTruthy()
    expect(baseAdapter.isSupportedChainId(ChainId.GNOSIS)).toBeTruthy()

    expect(baseAdapter.isSupportedChainId(ChainId.GOERLI)).toBeFalsy()
    expect(baseAdapter.isSupportedChainId(ChainId.POLYGON)).toBeFalsy()
    expect(baseAdapter.isSupportedChainId(ChainId.OPTIMISM_GOERLI)).toBeFalsy()
    expect(baseAdapter.isSupportedChainId(ChainId.OPTIMISM_MAINNET)).toBeFalsy()
  })
})
