import { createAction } from '@reduxjs/toolkit'

import { Field } from './types'

export const selectToken = createAction<{ tokenId: string }>('zap/selectToken')
export const selectPair = createAction<{ pairId: string; token0Id: string; token1Id: string }>('zap/selectPair')
export const typeInput = createAction<{ independentField: Field; typedValue: string }>('zap/typeInput')
export const updateZapState = createAction<{
  independentField: Field
  typedValue: string
  tokenId: string
  pairId: string
  pairToken0Id: string
  pairToken1Id: string
  recipient: string | null
}>('zap/updateZapState')
export const setRecipient = createAction<{ recipient: string | null }>('zap/setRecipient')
export const switchZapDirection = createAction<void>('zap/switchDirection')
