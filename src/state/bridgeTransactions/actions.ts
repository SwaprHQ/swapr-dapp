import { ChainId } from '@swapr/sdk'
import { createAction } from '@reduxjs/toolkit'

export const clearBridgeTxs = createAction<ChainId[]>('bridgeTxn/clearBridgeTxs')
