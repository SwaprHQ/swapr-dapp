import { createAction } from '@reduxjs/toolkit'

import { Field } from './types'

export const selectCurrency = createAction<{ field: Field; currencyId: string }>('zap/selectCurrency')
export const switchZapDirection = createAction<void>('zap/switchCurrencies')
export const typeInput = createAction<{ independentField: Field; typedValue: string }>('zap/typeInput')
export const replaceZapState = createAction<{
  field: Field
  typedValue: string
  inputCurrencyId?: string
  outputCurrencyId?: string
  recipient: string | null
}>('zap/replaceZapState')
export const setRecipient = createAction<{ recipient: string | null }>('zap/setRecipient')

export const setPairTokens = createAction<{ token0Address: string; token1Address: string }>('zap/setPairTokens')

export const setSelectedToken = createAction<{ currencyId: string }>('zap/setSelectedToken')
