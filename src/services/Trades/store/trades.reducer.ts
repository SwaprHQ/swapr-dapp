import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { SwaprTradesHistory } from '../adapters/swapr.adapter'

type InitialState = {
  swapr: SwaprTradesHistory | undefined
}
const initialState: InitialState = {
  swapr: undefined,
}

const tradesSlice = createSlice({
  name: 'trades',
  initialState,
  reducers: {
    setSwaprTradesHistory: (state, action: PayloadAction<SwaprTradesHistory>) => {
      state.swapr = action.payload
    },
  },
})

export default tradesSlice.reducer

export const { actions } = tradesSlice
