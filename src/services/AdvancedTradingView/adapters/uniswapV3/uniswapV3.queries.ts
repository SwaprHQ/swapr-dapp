import { gql } from 'graphql-request'

import { BASE_QUERY_FRAGMENT } from '../fragment.queries'

export const UNISWAP_PAIR_SWAPS_BURNS_AND_MINTS = gql`
  query getPairTradesAndActivity($token0_in: [Bytes]!, $token1_in: [Bytes]!, $first: Int!, $skip: Int!) {
    swaps(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
      id
      transaction {
        id
      }
      amount1
      amount0
      amountUSD
      timestamp
    }
    mints(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
    burns(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
  }
`

export const UNISWAP_PAIR_SWAPS = gql`
  query getPairTrades($token0_in: [Bytes]!, $token1_in: [Bytes]!, $first: Int!, $skip: Int!) {
    swaps(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
      id
      transaction {
        id
      }
      amount1
      amount0
      amountUSD
      timestamp
    }
  }
`

export const UNISWAP_PAIR_BURNS_AND_MINTS = gql`
  query getPairActivity($token0_in: [Bytes]!, $token1_in: [Bytes]!, $first: Int!, $skip: Int!) {
    mints(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
    burns(
      where: { token0_in: $token0_in, token1_in: $token1_in }
      first: $first
      skip: $skip
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
     ${BASE_QUERY_FRAGMENT}
      type: __typename
    }
  }
`
