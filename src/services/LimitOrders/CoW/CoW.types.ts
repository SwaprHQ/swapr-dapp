import { SigningResult } from '@cowprotocol/cow-sdk/dist/utils/sign'

import { getQuote } from '../../../pages/Swap/LimitOrder/api/cow'
import { LimitOrder } from '../LimitOrder.types'

export interface SignedLimitOrder extends LimitOrder {
  signature: string
  signingScheme: SigningResult['signingScheme']
}

export type CoWQuote = Awaited<ReturnType<typeof getQuote>>
