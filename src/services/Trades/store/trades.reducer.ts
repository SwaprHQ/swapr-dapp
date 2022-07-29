import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SwaprTradesHistory } from '../adapters/swapr.adapter'
import { AdapterKeys } from '../adapters/trades.adapter'

type InitialState = {
  swapr: SwaprTradesHistory | undefined
  loading: { [key in AdapterKeys]: boolean }
}
const initialState: InitialState = {
  swapr: undefined,
  loading: {
    swapr: false,
  },
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setAdapterLoading: (state, action: PayloadAction<{ key: AdapterKeys; isLoading: boolean }>) => {
      const { key, isLoading } = action.payload

      state.loading[key] = isLoading
    },
    setSwaprTradesHistory: (state, action: PayloadAction<SwaprTradesHistory>) => {
      state.swapr = action.payload
    },
  },
})

export default tradesSlice.reducer

export const { actions } = tradesSlice
