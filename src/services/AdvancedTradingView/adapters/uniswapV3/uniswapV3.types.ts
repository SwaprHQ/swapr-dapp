import { BaseActionPayload, PairBurnsAndMints, PairBurnsAndMintsTransaction } from '../baseAdapter/base.types'

export type UniswapV3PairSwapTransaction = {
  amount0: string
  amount1: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
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

export type UniswapV3SwapsBurnsAndMints = {
  swaps: UniswapV3PairSwapTransaction[]
  burns: PairBurnsAndMintsTransaction[]
  mints: PairBurnsAndMintsTransaction[]
}

export type UniswapV3PairSwaps = {
  swaps: UniswapV3PairSwapTransaction[]
}

export type UniswapV3PairBurnsAndMints = {
  burns: PairBurnsAndMintsTransaction[]
  mints: PairBurnsAndMintsTransaction[]
}

type UniswapV3PairSwapsPayload = BaseActionPayload<UniswapV3PairSwapTransaction[]>

export type UniswapV3Pair = {
  swaps?: { data: UniswapV3PairSwapTransaction[]; hasMore: boolean }
  burnsAndMints?: { data: PairBurnsAndMintsTransaction[]; hasMore: boolean }
}

export type UniswapV3ActionPayload = UniswapV3PairSwapsPayload | BaseActionPayload<PairBurnsAndMints>
