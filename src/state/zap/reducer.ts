import { createReducer } from '@reduxjs/toolkit'

import { selectPair, selectToken, setRecipient, typeInput, updateZapState } from './actions'
import { Asset, ZapState } from './types'

export const initialState: ZapState = {
  inputAsset: Asset.TOKEN,
  typedValue: '',
  [Asset.TOKEN]: {
    tokenId: '',
  },
  [Asset.PAIR]: {
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
      (state, { payload: { tokenId, pairToken0Id, pairToken1Id, typedValue, recipient, inputAsset } }) => {
        return {
          ...state,
          [Asset.TOKEN]: {
            tokenId: tokenId,
          },
          [Asset.PAIR]: {
            token0Id: pairToken0Id,
            token1Id: pairToken1Id,
          },
          inputAsset: inputAsset,
          typedValue: typedValue,
          recipient,
        }
      }
    )
    .addCase(selectToken, (state, { payload: { tokenId } }) => {
      return {
        ...state,
        [Asset.TOKEN]: { tokenId: tokenId },
      }
    })
    .addCase(selectPair, (state, { payload: { token0Id, token1Id } }) => {
      return {
        ...state,
        [Asset.PAIR]: {
          token0Id: token0Id,
          token1Id: token1Id,
        },
      }
    })
    .addCase(typeInput, (state, { payload: { inputAsset, typedValue } }) => {
      return {
        ...state,
        inputAsset: inputAsset,
        typedValue,
      }
    })
    .addCase(setRecipient, (state, { payload: { recipient } }) => {
      state.recipient = recipient
    })
)
