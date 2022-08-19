import { gql } from 'graphql-request'

export const SWAPR_PAIR_TRANSACTIONS = gql`
  query getPairTransactions($pairId: Bytes!, $first: Int!, $skip: Int!) {
    pair(id: $pairId) {
      id
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      mints(first: $first, skip: $skip) {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
      burns(first: $first, skip: $skip) {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
      swaps(first: $first, skip: $skip) {
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
