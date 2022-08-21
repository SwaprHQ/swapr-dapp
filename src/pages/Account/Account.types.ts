import { type ChainId } from '@swapr/sdk'

import { type BridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { type BridgeTransactionLog } from '../../state/bridgeTransactions/types'

export enum TransactionSwapTypes {
  Swap = 'Swap',
}

export enum TransactionBridgeTypes {
  Bridge = 'Bridge',
}

export interface Transaction {
  type: keyof typeof TransactionSwapTypes
  from: { value: number | string; token: string; chainId?: ChainId }
  to: { value: number | string; token: string; chainId?: ChainId }
  summary: string
  addedTime: number
  confirmedTime?: number
  hash: string
  status: string
  network?: ChainId
}

export interface BridgeTransaction extends Omit<Transaction, 'summary' | 'type' | 'addedTime'> {
  type: keyof typeof TransactionBridgeTypes
  logs: BridgeTransactionLog[]
  pendingReason?: string
  bridgeId: BridgeList
}
