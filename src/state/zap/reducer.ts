import { createReducer } from '@reduxjs/toolkit'

import { setPairTokens, setSelectedToken } from './actions'
import { Field, ZapState } from './types'

export const initialState: ZapState = {
  independentField: Field.INPUT,
  typedValue: '',
  pairTokens: {
    token0Address: '',
    token1Address: '',
  },
  selectedToken: '',
  pairAddress: '',
  recipient: null,
  protocolFeeTo: undefined,
}

export default createReducer<ZapState>(initialState, builder =>
  builder
    .addCase(setPairTokens, (state, { payload: { token0Address, token1Address } }) => {
      return {
        ...state,
        pairTokens: {
          token0Address,
          token1Address,
        },
      }
    })
    .addCase(setSelectedToken, (state, { payload: { currencyId } }) => {
      return {
        ...state,
        selectedToken: currencyId,
      }
    })
)
