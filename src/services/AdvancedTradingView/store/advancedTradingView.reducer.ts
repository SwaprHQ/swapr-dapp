import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import {
  BaseActionPayload,
  PairBurnsAndMintsTransaction,
  SetBurnsAndMintsActionPayload,
  SetSwapsActionPayload,
  SetSwapsBurnsAndMintsActionPayload,
} from '../adapters/baseAdapter/base.types'
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

    setSwapsBurnsAndMintsDataForAllPairs: (
      state: InitialState,
      action: PayloadAction<Array<SetSwapsBurnsAndMintsActionPayload>>
    ) => {
      const updatedAdapters: AdapterType = {
        ...state.adapters,
      }

      action.payload.forEach(adapter => {
        const { key, pairId, data, hasMore } = adapter

        const nextPairSwapData = state.adapters[key][pairId]?.[AdapterPayloadType.SWAPS]?.data ?? []
        const nextPairBurnsAndMintsData = state.adapters[key][pairId]?.[AdapterPayloadType.BURNS_AND_MINTS]?.data ?? []

        data.swaps.forEach(
          element => !nextPairSwapData.some(el => el.id === element.id) && nextPairSwapData.push(element)
        )
        data.burnsAndMints.forEach(
          element =>
            !nextPairBurnsAndMintsData.some(el => el.id === element.id) && nextPairBurnsAndMintsData.push(element)
        )

        updatedAdapters[key][pairId] = {
          ...updatedAdapters[key][pairId],
          swaps: {
            data: nextPairSwapData,
            hasMore,
          },
          burnsAndMints: {
            data: nextPairBurnsAndMintsData,
            hasMore,
          },
        }
      })

      state.adapters = updatedAdapters
    },

    // TODO: UPDATE ACTION TO HANDLE BOTH SWAPS AND ACTIVITY DATA
    setSwapsDataForAllPairs: (state: InitialState, action: PayloadAction<Array<SetSwapsActionPayload>>) => {
      const updatedAdapters: AdapterType = {
        ...state.adapters,
      }

      action.payload.forEach(adapter => {
        const { key, pairId, data, hasMore } = adapter

        const nextPairData = state.adapters[key][pairId]?.[AdapterPayloadType.SWAPS]?.data ?? []

        data.forEach(element => !nextPairData.some(el => el.id === element.id) && nextPairData.push(element))

        updatedAdapters[key][pairId] = {
          ...updatedAdapters[key][pairId],
          [AdapterPayloadType.SWAPS]: {
            data: nextPairData,
            hasMore,
          },
        }
      })

      state.adapters = updatedAdapters
    },

    setBurnsAndMintsDataForAllPairs: (
      state: InitialState,
      action: PayloadAction<Array<BaseActionPayload<PairBurnsAndMintsTransaction[]>>>
    ) => {
      const updatedAdapters: AdapterType = {
        ...state.adapters,
      }

      action.payload.forEach(adapter => {
        const { key, pairId, data, hasMore, payloadType } = adapter

        const nextPairData = state.adapters[key][pairId]?.[payloadType]?.data ?? []

        data.forEach(element => !nextPairData.some(el => el.id === element.id) && nextPairData.push(element))

        updatedAdapters[key][pairId] = {
          ...updatedAdapters[key][pairId],
          [payloadType]: {
            data: nextPairData,
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
