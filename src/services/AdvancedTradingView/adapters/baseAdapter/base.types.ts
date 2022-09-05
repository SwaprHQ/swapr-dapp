import { AdapterKeys, AdapterPayloadType } from '../../advancedTradingView.types'

// subgraph types
interface PairBurnsAndMintsTransaction {
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

interface SwapsWithLogo extends PairSwapTransaction {
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
type BasePayload = {
  key: AdapterKeys
  hasMore: boolean
  pairId: string
}

type SwaprPairSwapsPayload = {
  data: PairSwapTransaction[]
  payloadType: AdapterPayloadType.swaps
} & BasePayload

type SwaprPairBurnsAndMintsPayload = {
  data: PairBurnsAndMintsTransaction[]
  payloadType: AdapterPayloadType.burnsAndMints
} & BasePayload

export type BasePair = {
  swaps?: { data: PairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: PairBurnsAndMintsTransaction[]; hasMore: boolean }
}

export type SwaprActionPayload = SwaprPairSwapsPayload | SwaprPairBurnsAndMintsPayload
