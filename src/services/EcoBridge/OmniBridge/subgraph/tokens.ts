import { gql } from 'graphql-request'

export const homeTokensQuery = gql`
  query homeTokens {
    tokens(where: { homeAddress_contains: "0x" }, first: 1000) {
      chainId: homeChainId
      address: homeAddress
      name: homeName
      symbol
      decimals
    }
  }
`

export const foreignTokensQuery = gql`
  query foreignTokens {
    tokens(where: { foreignAddress_contains: "0x" }, first: 1000) {
      chainId: foreignChainId
      address: foreignAddress
      name: foreignName
      symbol
      decimals
    }
  }
`
