import { gql } from 'graphql-request'

export const TRANSACTIONS_QUERY = gql`
  query GetTransactions($txnId: String!) {
    transactions(where: { id: $txnId }) {
      id
      blockNumber
      timestamp
      swaps {
        amount0In
        amount1In
        amount0Out
        amount1Out
        pair {
          token0 {
            symbol
          }
          token1 {
            symbol
          }
        }
      }
    }
  }
`
export const LIQUIDITY_CAMPAIGNS_QUERY = gql`
  query GetLiquidityCampaigns($owner: String!, $startsAt: Int!) {
    liquidityMiningCampaigns(where: { owner: $owner, startsAt: $startsAt }, first: 1) {
      owner
      startsAt
      endsAt
      stakablePair {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
      rewards {
        token {
          symbol
        }
        amount
      }
    }
  }
`

export const TOKENS_QUERY = gql`
  query GetTokens() {
    tokens(first: 500) {
      id
      symbol
      name
    }
  }
`
