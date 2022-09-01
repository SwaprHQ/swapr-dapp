import { ChainId } from '@swapr/sdk'

import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'

type XdaiBridgeBaseTransactionData = {
  id: string
  transactionHash: string
  timestamp: string
  recipient: string
  value: string
}

type XdaiBridgeRequest = XdaiBridgeBaseTransactionData & {
  sender: string
  message?: {
    id: string | null
    content: string | null
    signatures: string[] | null
  }
}

type XdaiBridgeExecution = XdaiBridgeBaseTransactionData

export type XdaiBridgeRequests = {
  requests: XdaiBridgeRequest[]
}

export type XdaiBridgeExecutions = {
  executions: XdaiBridgeExecution[]
}

export type XdaiBridgeTransaction = {
  txHash: string
  partnerTransactionHash?: string
  assetName: string
  assetAddressL1: string
  assetAddressL2: string
  value: string
  fromChainId: ChainId
  toChainId: ChainId
  sender: string
  status: BridgeTransactionStatus
  timestampResolved?: number
  needsClaiming: boolean
  isFulfilling?: boolean
} & Pick<XdaiBridgeRequest, 'message'>

export type XdaiMessage = Pick<XdaiBridgeRequest, 'message'>
