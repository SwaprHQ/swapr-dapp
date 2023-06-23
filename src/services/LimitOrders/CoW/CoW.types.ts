import { SigningResult } from '@cowprotocol/cow-sdk/dist/utils/sign'

import { LimitOrder } from '../LimitOrder.types'

import { getQuote } from './api/cow'

export interface SignedLimitOrder extends LimitOrder {
  signature: string
  signingScheme: SigningResult['signingScheme']
}

export type CoWQuote = Awaited<ReturnType<typeof getQuote>>
