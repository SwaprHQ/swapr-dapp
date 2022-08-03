import { gql } from 'graphql-request'

export const SWAPR_PAIR_TRANSACTIONS = gql`
  query getPairTransactions($pairId: Bytes!) {
    pair(id: $pairId) {
      id
      token0 {
        symbol
      }
      token1 {
        symbol
      }
      mints(first: 1000) {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
      burns(first: 1000) {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
      swaps(first: 1000) {
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
  }
`
