import { gql } from 'graphql-request'

export const XDAI_BRIDGE_HOME_REQUEST = gql`
  query getRequests($user: String!) {
    requests(where: { sender: $user }, first: 1000) {
      id
      transactionHash
      timestamp
      sender
      recipient
      value
      message {
        id
        content
        signatures
      }
    }
  }
`
export const XDAI_BRIDGE_FOREIGN_REQUEST = gql`
  query getRequests($user: String!) {
    requests(where: { sender: $user }, first: 1000) {
      id
      transactionHash
      timestamp
      sender
      recipient
      value
    }
  }
`

export const XDAI_BRIDGE_EXECUTIONS = gql`
  query getExecutions($transactionsHash: [Bytes!]) {
    executions(where: { transactionHash_in: $transactionsHash }, first: 1000) {
      id
      transactionHash
      timestamp
      recipient
      value
    }
  }
`
export const XDAI_MESSAGE = gql`
  query getMessage($transactionHash: ID!) {
    request(id: $transactionHash) {
      message {
        id
        content
        signatures
      }
    }
  }
`
