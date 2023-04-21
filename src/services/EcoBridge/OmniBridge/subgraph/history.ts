import { gql } from 'graphql-request'

export const requestsUserQuery = gql`
  query getRequests($user: String!) {
    requests: userRequests(where: { user: $user }, orderBy: txHash, orderDirection: desc, first: 1000) {
      user: recipient
      txHash
      messageId
      timestamp
      amount
      token
      decimals
      symbol
      message {
        txHash
        messageId: msgId
        messageData: msgData
        signatures
      }
    }
  }
`

export const executionsQuery = gql`
  query getExecutions($messageIds: [Bytes!]) {
    executions(where: { messageId_in: $messageIds }, first: 1000, orderBy: txHash, orderDirection: desc) {
      txHash
      messageId
      token
      status
      amount
    }
  }
`
export const partnerTxHashQuery = gql`
  query getReceivingTxHash($messageId: String!) {
    executions(where: { messageId: $messageId }) {
      txHash
    }
  }
`
