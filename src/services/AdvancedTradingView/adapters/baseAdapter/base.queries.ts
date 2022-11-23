import { gql } from 'graphql-request'

import { BASE_QUERY_FRAGMENT } from '../fragment.queries'

export const PAIR_SWAPS_BURNS_AND_MINTS = gql`
  query getPairTradesAndActivity($pairId: Bytes!, $first: Int!, $skip: Int!) {
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
    mints(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
    burns(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
  }
`

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
    mints(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
    burns(where: { pair: $pairId }, first: $first, skip: $skip, orderDirection: "desc", orderBy: "timestamp") {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
  }
`
