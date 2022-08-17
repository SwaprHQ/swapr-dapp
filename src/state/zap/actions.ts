import { createAction } from '@reduxjs/toolkit'

import { Asset } from './types'

export const selectToken = createAction<{ tokenId: string }>('zap/selectToken')
export const selectPair = createAction<{ token0Id: string; token1Id: string }>('zap/selectPair')
export const typeInput = createAction<{ inputAsset: Asset; typedValue: string }>('zap/typeInput')
export const updateZapState = createAction<{
  inputAsset: Asset
  typedValue: string
  tokenId: string
  pairToken0Id: string
  pairToken1Id: string
  recipient: string | null
}>('zap/updateZapState')
export const setRecipient = createAction<{ recipient: string | null }>('zap/setRecipient')
