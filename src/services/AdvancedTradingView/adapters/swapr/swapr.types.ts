import { AdapterPayloadType } from '../../advancedTradingView.types'

// subgraph types
type SwaprPairBurnsAndMintsTransaction = {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

type SwaprPairSwapTransaction = {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export type SwaprPairSwaps = {
  swaps: SwaprPairSwapTransaction[]
}

export type SwaprPairBurnsAndMints = {
  burns: SwaprPairBurnsAndMintsTransaction[]
  mints: SwaprPairBurnsAndMintsTransaction[]
}

// swapr reducer types
type BasePayload = {
  hasMore: boolean
  pairId: string
}

type SwaprPairSwapsPayload = {
  data: SwaprPairSwapTransaction[]
  payloadType: AdapterPayloadType.swaps
} & BasePayload

type SwaprPairBurnsAndMintsPayload = {
  data: SwaprPairBurnsAndMintsTransaction[]
  payloadType: AdapterPayloadType.burnsAndMints
} & BasePayload

export type SwaprPair = {
  swaps?: { data: SwaprPairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: SwaprPairBurnsAndMintsTransaction[]; hasMore: boolean }
}

export type SwaprActionPayload = SwaprPairSwapsPayload | SwaprPairBurnsAndMintsPayload
