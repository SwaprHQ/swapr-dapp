import { Token } from '@swapr/sdk'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { InitialState, SwaprTradesHistory } from './trades.types'

const initialState: InitialState = {
  pair: {
    inputToken: undefined,
    outputToken: undefined,
  },
  sources: {
    swapr: {
      transactions: undefined,
      fetchDetails: {
        pairId: undefined,
        hasMore: true,
      },
    },
  },
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setPairTokensAddresses: (
      state,
      { payload: { inputToken, outputToken } }: PayloadAction<{ inputToken: Token; outputToken: Token }>
    ) => {
      state.pair.inputToken = inputToken
      state.pair.outputToken = outputToken
    },
    // adapters setters
    setSwaprTradesHistory: (
      state,
      action: PayloadAction<{ data: SwaprTradesHistory; hasMore: boolean; pairId: string }>
    ) => {
      const { data, hasMore, pairId } = action.payload

      const {
        sources: { swapr },
      } = state

      swapr.fetchDetails = {
        hasMore,
        pairId,
      }

      // set new pair
      if (swapr.transactions?.pair?.id.toLowerCase() !== data.pair?.id.toLowerCase()) {
        state.sources.swapr.transactions = data
        return
      }

      // update pair swaps
      if (swapr.transactions && swapr.transactions.pair && data.pair) {
        swapr.transactions.pair.swaps = [...swapr.transactions.pair.swaps, ...data.pair?.swaps]
      }
    },
  },
})

export default tradesSlice.reducer

export const { actions } = tradesSlice
