import { AdapterKeys, AdapterPayloadType } from '../../advancedTradingView.types'

// subgraph types
export interface PairBurnsAndMintsTransaction {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

interface PairSwapTransaction {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export interface SwapsWithLogo extends PairSwapTransaction {
  logoKey: string
}
interface BurnsAndMintsWithLogo extends PairBurnsAndMintsTransaction {
  logoKey: string
}

export type AllTradesAndLiquidityFromAdapters = {
  swaps: SwapsWithLogo[]
  burnsAndMints: BurnsAndMintsWithLogo[]
}

export type PairSwaps = {
  swaps: PairSwapTransaction[]
}

export type PairBurnsAndMints = {
  burns: PairBurnsAndMintsTransaction[]
  mints: PairBurnsAndMintsTransaction[]
}

// swapr reducer types
export type BasePayload = {
  key: AdapterKeys
  hasMore: boolean
  pairId: string
}

type BasePairSwapsPayload = {
  data: PairSwapTransaction[]
  payloadType: AdapterPayloadType.swaps
} & BasePayload

export type BasePairBurnsAndMintsPayload = {
  data: PairBurnsAndMintsTransaction[]
  payloadType: AdapterPayloadType.burnsAndMints
} & BasePayload

export type BasePair = {
  swaps?: { data: PairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: PairBurnsAndMintsTransaction[]; hasMore: boolean }
}

export type BaseActionPayload = BasePairSwapsPayload | BasePairBurnsAndMintsPayload
