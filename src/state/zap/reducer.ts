import { createReducer } from '@reduxjs/toolkit'

import { replaceZapState, selectCurrency, setPairTokens, setRecipient, switchZapDirection, typeInput } from './actions'
import { Field, ZapState } from './types'

export const initialState: ZapState = {
  independentField: Field.INPUT,
  typedValue: '',
  [Field.INPUT]: {
    currencyId: '',
  },
  [Field.OUTPUT]: {
    currencyId: '',
  },
  pairTokens: {
    token0Id: '',
    token1Id: '',
  },
  recipient: null,
  protocolFeeTo: undefined,
}

export default createReducer<ZapState>(initialState, builder =>
  builder
    .addCase(setPairTokens, (state, { payload: { token0Id, token1Id } }) => {
      return {
        ...state,
        pairTokens: {
          token0Id,
          token1Id,
        },
      }
    })
    .addCase(
      replaceZapState,
      (state, { payload: { typedValue, recipient, field, inputCurrencyId, outputCurrencyId } }) => {
        return {
          ...state,
          [Field.INPUT]: {
            currencyId: inputCurrencyId,
          },
          [Field.OUTPUT]: {
            currencyId: outputCurrencyId,
          },
          independentField: field,
          typedValue: typedValue,
          recipient,
        }
      }
    )
    .addCase(selectCurrency, (state, { payload: { field, currencyId } }) => {
      const otherField = field === Field.INPUT ? Field.OUTPUT : Field.INPUT

      if (currencyId === state[otherField].currencyId) {
        // the case where we have to swap the order
        return {
          ...state,
          independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
          [field]: { currencyId: currencyId },
          [otherField]: { currencyId: state[field].currencyId },
        }
      } else {
        // the normal case
        return {
          ...state,
          [field]: { currencyId: currencyId },
        }
      }
    })
    .addCase(switchZapDirection, state => {
      return {
        ...state,
        independentField: state.independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT,
        [Field.INPUT]: { currencyId: state[Field.OUTPUT].currencyId },
        [Field.OUTPUT]: { currencyId: state[Field.INPUT].currencyId },
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
    .addCase(typeInput, (state, { payload: { independentField, typedValue } }) => {
      return {
        ...state,
        independentField: independentField,
        typedValue,
      }
    })
)
