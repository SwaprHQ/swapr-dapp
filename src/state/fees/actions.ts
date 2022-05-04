import { createAction } from '@reduxjs/toolkit'
import { BigintIsh } from '@swapr/sdk'

export const setSwapFees = createAction<{
  swapFees:
    | {
        [key: string]: {
          fee: BigintIsh
          owner: string
        }
      }
    | Record<string, never>
}>('setSwapFees')
export const setProtocolFee = createAction<{ protocolFeeDenominator: number; protocolFeeTo: string }>('setProtocolFee')
