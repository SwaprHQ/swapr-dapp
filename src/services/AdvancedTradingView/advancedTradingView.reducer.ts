import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { InitialState, SwaprActivity, SwaprTrades } from './advancedTradingView.types'

const initialState: InitialState = {
  pair: {
    inputToken: undefined,
    outputToken: undefined,
  },
  adapters: {
    swapr: {
      pair: {
        id: undefined,
        swaps: [],
        burnsAndMints: [],
      },
      fetchDetails: {
        hasMoreTrades: true,
        hasMoreActivity: true,
      },
    },
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
      state.pair.inputToken = inputToken
      state.pair.outputToken = outputToken
    },
    // adapters setters
    setSwaprPairInitialArguments: (state, action: PayloadAction<string>) => {
      state.adapters.swapr.pair = {
        id: action.payload,
        swaps: [],
        burnsAndMints: [],
      }
      state.adapters.swapr.fetchDetails = {
        hasMoreActivity: true,
        hasMoreTrades: true,
      }
    },
    setSwaprPairTrades: (state, action: PayloadAction<{ data: SwaprTrades; hasMore: boolean }>) => {
      const {
        data: { pair },
        hasMore,
      } = action.payload

      state.adapters.swapr.pair.swaps = [...state.adapters.swapr.pair.swaps, ...(pair?.swaps ?? [])]

      state.adapters.swapr.fetchDetails.hasMoreTrades = hasMore
    },
    setSwaprPairActivity: (state, action: PayloadAction<{ data: SwaprActivity; hasMore: boolean }>) => {
      const {
        data: { pair },
        hasMore,
      } = action.payload

      const burnsAndMints = [...(pair?.mints ?? []), ...(pair?.burns ?? [])]

      state.adapters.swapr.pair.burnsAndMints = [...state.adapters.swapr.pair.burnsAndMints, ...burnsAndMints]

      state.adapters.swapr.fetchDetails.hasMoreActivity = hasMore
    },
  },
})

export default advancedTradingViewSlice.reducer

export const { actions } = advancedTradingViewSlice
