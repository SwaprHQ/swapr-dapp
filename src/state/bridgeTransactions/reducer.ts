import { createReducer } from '@reduxjs/toolkit'

import { clearBridgeTxs } from './actions'

import { ArbitrumBridgeTxnsState } from './types'

export const initialState: ArbitrumBridgeTxnsState = {}

export default createReducer<ArbitrumBridgeTxnsState>(initialState, builder =>
  builder.addCase(clearBridgeTxs, (state, { payload: chains }) => {
    chains.forEach(chainId => {
      if (state[chainId]) delete state[chainId]
    })
  })
)
