import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SwaprTradesHistory } from '../adapters/swapr.adapter'
import { AdapterKeys } from '../adapters/trades.adapter'

type InitialState = {
  sources: {
    swapr: {
      transactions: SwaprTradesHistory | undefined
      loading: boolean
    }
  }
}
const initialState: InitialState = {
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
    setSwaprTradesHistory: (state, action: PayloadAction<SwaprTradesHistory | undefined>) => {
      state.sources.swapr.transactions = action.payload
    },
  },
})

export default tradesSlice.reducer

export const { actions } = tradesSlice
