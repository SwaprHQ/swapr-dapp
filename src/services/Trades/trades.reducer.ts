import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { AdapterKeys, InitialState, SwaprTradesHistory } from './trades.types'

const initialState: InitialState = {
  pair: {
    fromTokenAddress: undefined,
    toTokenAddress: undefined,
  },
  sources: {
    swapr: {
      transactions: undefined,
      loading: false,
    },
  },
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setAdapterLoading: (state, action: PayloadAction<{ key: AdapterKeys; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload

      state.sources[key].loading = isLoading
    },
    setPairTokensAddresses: (
      state,
      {
        payload: { fromTokenAddress, toTokenAddress },
      }: PayloadAction<{ fromTokenAddress: string; toTokenAddress: string }>
    ) => {
      state.pair.fromTokenAddress = fromTokenAddress
      state.pair.toTokenAddress = toTokenAddress
    },
    // adapters setters
    setSwaprTradesHistory: (state, action: PayloadAction<SwaprTradesHistory | undefined>) => {
      state.sources.swapr.transactions = action.payload
    },
  },
})

export default tradesSlice.reducer

export const { actions } = tradesSlice
