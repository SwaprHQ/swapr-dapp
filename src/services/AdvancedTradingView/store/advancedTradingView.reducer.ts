import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BaseActionPayload } from '../adapters/baseAdapter/base.types'
import { AdapterPayloadType, AdapterType, InitialState } from '../advancedTradingView.types'

export const initialState: InitialState = {
  pair: {
    inputToken: undefined,
    outputToken: undefined,
  },
  adapters: {
    swapr: {},
    sushiswap: {},
    uniswapV2: {},
    honeyswap: {},
    uniswapV3: {},
  },
}

const advancedTradingViewSlice = createSlice({
  name: 'advancedTradingView',
  initialState,
  reducers: {
    setPairTokens: (
      state,
      { payload: { inputToken, outputToken } }: PayloadAction<{ inputToken: Token; outputToken: Token }>
    ) => {
      state.pair = {
        inputToken,
        outputToken,
      }
    },

    resetAdapterStore: (state, action: PayloadAction<{ resetSelectedPair: boolean }>) => {
      if (action.payload.resetSelectedPair) {
        state.pair = {}
      }
      state.adapters = {
        swapr: {},
        sushiswap: {},
        uniswapV2: {},
        honeyswap: {},
        uniswapV3: {},
      }
    },

    setPairData: (state, action: PayloadAction<BaseActionPayload<unknown[]>>) => {
      const { data, pairId, payloadType, hasMore, key } = action.payload

      const previousPairData = state.adapters[key][pairId]?.[payloadType]?.data ?? []

      state.adapters[key][pairId] = {
        ...state.adapters[key][pairId],
        [payloadType]: {
          data: [...previousPairData, ...data],
          hasMore,
        },
      }
    },

    // TODO: UPDATE ACTION TO HANDLE BOTH SWAPS AND ACTIVITY DATA
    // TODO: DEFINE PAYLOAD DATA MODEL
    setSwapsDataForAllPairs: (state: InitialState, action: PayloadAction<Array<BaseActionPayload<unknown[]>>>) => {
      console.log('ACTION PAYLOAD', action.payload)
      // [{key: 'uniswapV2', pairId: '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11', data: Array(12), hasMore: true}]
      let updatedAdapters: AdapterType = {
        swapr: {},
        sushiswap: {},
        uniswapV2: {},
        honeyswap: {},
        uniswapV3: {},
      }

      // TODO: UPDATED DATA HANDLING OF EACH PAIR
      action.payload.forEach(pair => {
        const { data, pairId, hasMore, key } = pair

        const previousPairData = state.adapters[key][pairId]?.[AdapterPayloadType.SWAPS]?.data ?? []

        updatedAdapters[key][pairId] = {
          ...state.adapters[key][pairId],
          swaps: {
            // @ts-ignore
            data: [...previousPairData, ...data],
            hasMore,
          },
        }
      })

      state.adapters = updatedAdapters
    },
  },
})

export default advancedTradingViewSlice.reducer

export const { actions } = advancedTradingViewSlice
