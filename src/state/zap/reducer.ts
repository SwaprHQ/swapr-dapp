import { createReducer } from '@reduxjs/toolkit'

import { selectPair, selectToken, setRecipient, switchZapDirection, typeInput, updateZapState } from './actions'
import { Field, ZapState } from './types'

export const initialState: ZapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    tokenId: '',
  },
  [Field.OUTPUT]: {
    pairId: '',
    token0Id: '',
    token1Id: '',
  },
  recipient: null,
  protocolFeeTo: undefined,
}

export default createReducer<ZapState>(initialState, builder =>
  builder
    .addCase(
      updateZapState,
      (
        state,
        { payload: { tokenId, pairId, pairToken0Id, pairToken1Id, typedValue, recipient, independentField } }
      ) => {
        return {
          ...state,
          [Field.INPUT]: {
            tokenId: tokenId,
          },
          [Field.OUTPUT]: {
            pairId: pairId,
            token0Id: pairToken0Id,
            token1Id: pairToken1Id,
          },
          independentField: independentField,
          typedValue: typedValue,
          recipient,
        }
      }
    )
    .addCase(selectToken, (state, { payload: { tokenId } }) => {
      return {
        ...state,
        [Field.INPUT]: { tokenId: tokenId },
      }
    })
    .addCase(selectPair, (state, { payload: { pairId, token0Id, token1Id } }) => {
      return {
        ...state,
        [Field.OUTPUT]: {
          pairId: pairId,
          token0Id: token0Id,
          token1Id: token1Id,
        },
      }
    })
    .addCase(typeInput, (state, { payload: { independentField, typedValue } }) => {
      return {
        ...state,
        independentField: independentField,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(switchZapDirection, state => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
      }
    })
)
