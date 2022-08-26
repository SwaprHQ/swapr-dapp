import { type ChainId } from '@swapr/sdk'

import { type BridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { type BridgeTransactionLog } from '../../state/bridgeTransactions/types'

export enum TransactionSwapTypes {
  Swap = 'Swap',
}

export enum TransactionBridgeTypes {
  Bridge = 'Bridge',
}

interface Token {
  value: number
  token: string
  chainId?: ChainId
  tokenAddress?: string
}

export interface SwapTransaction {
  type: keyof typeof TransactionSwapTypes
  from: Token
  to: Token
  summary: string
  addedTime: number
  confirmedTime?: number
  hash: string
  status: string
  network?: ChainId
}

export interface BridgeTransaction extends Omit<SwapTransaction, 'summary' | 'type' | 'addedTime'> {
  type: keyof typeof TransactionBridgeTypes
  pendingReason?: string
  bridgeId: BridgeList
  logs: BridgeTransactionLog[]
}

export type Transaction = SwapTransaction | BridgeTransaction
