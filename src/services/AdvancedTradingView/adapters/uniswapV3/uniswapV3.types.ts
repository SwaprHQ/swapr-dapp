import { AdapterKeys, AdapterPayloadType } from '../../advancedTradingView.types'

type UniswapV3PairSwapTransaction = {
  amount0: string
  amount1: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

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

export interface UniswapV3SwapsWithLogo extends UniswapV3PairSwapTransaction {
  logoKey: string
}

export interface BurnsAndMintsWithLogo extends PairBurnsAndMintsTransaction {
  logoKey: string
}

export type AllTradesAndLiquidityFromUniswapV3Adapters = {
  swaps: UniswapV3SwapsWithLogo[]
  burnsAndMints: BurnsAndMintsWithLogo[]
}

export type UniswapV3PairSwaps = {
  swaps: UniswapV3PairSwapTransaction[]
}

export type UniswapV3PairBurnsAndMints = {
  burns: PairBurnsAndMintsTransaction[]
  mints: PairBurnsAndMintsTransaction[]
}

export type BasePayload = {
  key: AdapterKeys
  hasMore: boolean
  pairId: string
}

type UniswapV3PairSwapsPayload = {
  data: UniswapV3PairSwapTransaction[]
  payloadType: AdapterPayloadType.swaps
} & BasePayload

type UniswapV3PairBurnsAndMintsPayload = {
  data: PairBurnsAndMintsTransaction[]
  payloadType: AdapterPayloadType.burnsAndMints
} & BasePayload

export type BasePair = {
  swaps?: { data: UniswapV3PairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: PairBurnsAndMintsTransaction[]; hasMore: boolean }
}

export type UniswapV3ActionPayload = UniswapV3PairSwapsPayload | UniswapV3PairBurnsAndMintsPayload
