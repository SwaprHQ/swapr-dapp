import { AdapterPayloadType } from '../../advancedTradingView.types'

// subgraph types
export type SwaprLiquidityTransaction = {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

export type SwaprTradeTransaction = {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export type SwaprPairTrades = {
  pair: {
    swaps: SwaprTradeTransaction[]
  } | null
}

export type SwaprPairActivity = {
  pair: {
    burns: SwaprLiquidityTransaction[]
    mints: SwaprLiquidityTransaction[]
  } | null
}

// swapr reducer types
type BasePayload = {
  hasMore: boolean
  pairId: string
}

export type SwaprTradesPayload = {
  data: SwaprTradeTransaction[]
  payloadType: AdapterPayloadType.swaps
} & BasePayload

export type SwaprActivityPayload = {
  data: SwaprLiquidityTransaction[]
  payloadType: AdapterPayloadType.burnsAndMints
} & BasePayload

export type SwaprPair = {
  swaps?: { data: SwaprTradeTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: SwaprLiquidityTransaction[]; hasMore: boolean }
}

export type SwaprActionPayload = SwaprTradesPayload | SwaprActivityPayload
