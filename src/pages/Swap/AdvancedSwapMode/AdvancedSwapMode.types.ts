export type SwapsHistory = {
  id: string
  transaction: {
    id: string
  }
  amount0In: string
  amount1In: string
  amount0Out: string
  amount1Out: string
  amountUSD: string
  timestamp: string
}

export type TransactionHistory = {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

export type Token = {
  id: string
  symbol: string
  decimals: string
}

export type Pair = {
  id: string
  token0: Token
  token1: Token
}

export type PairHistoryTransactions = {
  mints: TransactionHistory[]
  burns: TransactionHistory[]
  swaps: SwapsHistory[]
}
