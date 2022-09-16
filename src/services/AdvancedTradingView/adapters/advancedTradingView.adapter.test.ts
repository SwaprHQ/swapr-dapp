import { ChainId, Token } from '@swapr/sdk'

import { configureStore, Store } from '@reduxjs/toolkit'

import advancedTradingView, { actions } from '../advancedTradingView.reducer'
import { AdapterKeys, AdapterPayloadType } from '../advancedTradingView.types'
import { adapters } from './adapters.config'
import { AdvancedTradingViewAdapter } from './advancedTradingView.adapter'
import { BaseAppState } from './baseAdapter/base.adapter'

const USDC_TOKEN = new Token(ChainId.MAINNET, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin')
const USDT_TOKEN = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6, 'USDT', 'Tether USD')

const fakeData = {
  pairId: '0x123456789',
  data: [],
  hasMore: false,
  key: AdapterKeys.SWAPR,
  payloadType: AdapterPayloadType.swaps,
}

describe('AdvancedTradingView - adapter', () => {
  let store: Store<BaseAppState>
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
  })

  it('isInitialized property is true after init method', () => {
    expect(advancedTradingViewAdapter.isInitialized).toBeFalsy()

    advancedTradingViewAdapter.init()

    expect(advancedTradingViewAdapter.isInitialized).toBeTruthy()
  })

  it('setPairTokens function sets tokens to store', () => {
    advancedTradingViewAdapter.setPairTokens(USDC_TOKEN, USDT_TOKEN)

    const { inputToken, outputToken } = store.getState().advancedTradingView.pair

    expect(inputToken).toBe(USDC_TOKEN)
    expect(outputToken).toBe(USDT_TOKEN)
  })

  it(`store is not undefined inside adapter and has correct initial state`, () => {
    expect(advancedTradingViewAdapter.store).not.toBeUndefined()

    expect(store.getState().advancedTradingView).toMatchInlineSnapshot(`
        Object {
          "adapters": Object {
            "honeyswap": Object {},
            "sushiswap": Object {},
            "swapr": Object {},
            "uniswapV2": Object {},
            "uniswapV3": Object {},
          },
          "pair": Object {
            "inputToken": undefined,
            "outputToken": undefined,
          },
        }
      `)
  })

  it('updateActiveChainId function resets state of store', () => {
    store.dispatch(actions.setPairData(fakeData))

    expect(store.getState().advancedTradingView).toMatchInlineSnapshot(`
      Object {
        "adapters": Object {
          "honeyswap": Object {},
          "sushiswap": Object {},
          "swapr": Object {
            "0x123456789": Object {
              "swaps": Object {
                "data": Array [],
                "hasMore": false,
              },
            },
          },
          "uniswapV2": Object {},
          "uniswapV3": Object {},
        },
        "pair": Object {
          "inputToken": undefined,
          "outputToken": undefined,
        },
      }
    `)

    advancedTradingViewAdapter.updateActiveChainId(ChainId.GNOSIS)

    expect(store.getState().advancedTradingView).toMatchInlineSnapshot(`
      Object {
        "adapters": Object {
          "honeyswap": Object {},
          "sushiswap": Object {},
          "swapr": Object {},
          "uniswapV2": Object {},
          "uniswapV3": Object {},
        },
        "pair": Object {},
      }
    `)
  })
})
