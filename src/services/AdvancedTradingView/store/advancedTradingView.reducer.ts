import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { BaseActionPayload, SetSwapsBurnsAndMintsActionPayload } from '../adapters/baseAdapter/base.types'
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

    setSwapsBurnsAndMintsDataForAllPairs: (
      state: InitialState,
      action: PayloadAction<Array<SetSwapsBurnsAndMintsActionPayload>>
    ) => {
      const updatedAdapters: AdapterType = {
        ...state.adapters,
      }

      action.payload.forEach(adapter => {
        if (!adapter) {
          return
        }

        const { key, pairId, data, hasMore } = adapter

        const nextPairSwapData = state.adapters[key][pairId]?.[AdapterPayloadType.SWAPS]?.data ?? []
        const nextPairBurnsAndMintsData = state.adapters[key][pairId]?.[AdapterPayloadType.BURNS_AND_MINTS]?.data ?? []

        data.swaps.forEach(
          swap => !nextPairSwapData.some(nextPairSwap => nextPairSwap.id === swap.id) && nextPairSwapData.push(swap)
        )
        data.burnsAndMints.forEach(
          burnAndMint =>
            !nextPairBurnsAndMintsData.some(nextPairBurnAndMint => nextPairBurnAndMint.id === burnAndMint.id) &&
            nextPairBurnsAndMintsData.push(burnAndMint)
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

    setDataTypeForAllPairs: (state: InitialState, action: PayloadAction<BaseActionPayload[]>) => {
      const updatedAdapters: AdapterType = {
        ...state.adapters,
      }

      action.payload.forEach(adapter => {
        const { key, pairId, data, hasMore, payloadType } = adapter

        const nextPairData = state.adapters[key][pairId]?.[payloadType]?.data ?? []

        data.forEach(
          incomingPairData =>
            !nextPairData.some(existingPairData => existingPairData.id === incomingPairData.id) &&
            nextPairData.push(incomingPairData)
        )

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
