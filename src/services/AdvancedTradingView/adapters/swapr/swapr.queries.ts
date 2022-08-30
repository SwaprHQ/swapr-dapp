import { gql } from 'graphql-request'

export const SWAPR_PAIR_TRADES = gql`
  query getPairTrades($pairId: Bytes!, $first: Int!, $skip: Int!) {
    pair(id: $pairId) {
      swaps(first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
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

export const SWAPR_PAIR_ACTIVITY = gql`
  query getPairActivity($pairId: Bytes!, $first: Int!, $skip: Int!) {
    pair(id: $pairId) {
      mints(first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
      burns(first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
        id
        transaction {
          id
        }
        amount0
        amount1
        amountUSD
        timestamp
      }
    }
  }
`
