import { gql } from 'graphql-request'

export const QUERY_PAIRS = gql`
  query getPairs {
    pairs(first: 1000) {
      id
      token0 {
        id
        decimals
        symbol
      }
      token1 {
        id
        decimals
        symbol
      }
    }
  }
`

//TODO: add pagination
export const QUERY_PAIR_TRANSACTIONS = gql`
  query getPairTransactions($pairId: Bytes!) {
    mints(where: { pair: $pairId }, first: 1000) {
      id
      transaction {
        id
      }
      amount0
      amount1
      amountUSD
      timestamp
    }
    burns(where: { pair: $pairId }, first: 1000) {
      id
      transaction {
        id
      }
      amount0
      amount1
      amountUSD
      timestamp
    }
    swaps(where: { pair: $pairId }, first: 1000) {
      id
      transaction {
        id
      }
      amount0In
      amount1In
      amount0Out
      amount1Out
      amountUSD
      timestamp
    }
  }
`
