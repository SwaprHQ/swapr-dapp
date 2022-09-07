import { gql } from 'graphql-request'

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
      first: 50
      skip: 0
      orderDirection: "desc"
      orderBy: "timestamp"
    ) {
      id
      transaction {
        id
      }
      amount0
      amount1
      amountUSD
      timestamp
    }
    burns(
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
      amount0
      amount1
      amountUSD
      timestamp
    }
  }
`
