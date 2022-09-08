import { gql } from 'graphql-request'

export const PAIR_SWAPS = gql`
  query getPairTrades($pairId: Bytes!, $first: Int!, $skip: Int!) {
    swaps(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
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

export const PAIR_BURNS_AND_MINTS = gql`
  query getPairActivity($pairId: Bytes!, $first: Int!, $skip: Int!) {
    mints(where: { pair: $pairId }, first: 50, skip: 0, orderDirection: "desc", orderBy: "timestamp") {
      id
      transaction {
        id
      }
      amount0
      amount1
      amountUSD
      timestamp
      type: __typename
    }
    burns(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
      id
      transaction {
        id
      }
      amount0
      amount1
      amountUSD
      timestamp
      type: __typename
    }
  }
`
