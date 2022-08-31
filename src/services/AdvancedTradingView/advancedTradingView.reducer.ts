import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SwaprActionPayload } from './adapters/baseAdapter/base.types'
import { InitialState } from './advancedTradingView.types'

const initialState: InitialState = {
  pair: {
    inputToken: undefined,
    outputToken: undefined,
  },
  adapters: {
    swapr: {},
    sushiswap: {},
    uniswapV2: {},
    honeyswap: {},
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
    resetAdapterStore: state => {
      state.pair = {}
      state.adapters.swapr = {}
    },
    setPairData: (state, action: PayloadAction<SwaprActionPayload>) => {
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
  },
})

export default advancedTradingViewSlice.reducer

export const { actions } = advancedTradingViewSlice
