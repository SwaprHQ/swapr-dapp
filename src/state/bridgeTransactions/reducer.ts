import { createReducer } from '@reduxjs/toolkit'

import { clearBridgeTxs } from './actions'

import { BridgeTxnsState } from './types'

export const initialState: BridgeTxnsState = {}

export default createReducer<BridgeTxnsState>(initialState, builder =>
  builder.addCase(clearBridgeTxs, (state, { payload: chains }) => {
    chains.forEach(chainId => {
      if (state[chainId]) delete state[chainId]
    })
  })
)
