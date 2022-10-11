import { type ChainId } from '@swapr/sdk'

import { type BridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { type BridgeTransactionLog } from '../../state/bridgeTransactions/types'
import { TransactionDetails } from '../../state/transactions/reducer'
import { LimitOrderTransaction } from './../../modules/limit-orders/utils/hooks'

export enum TransactionTypes {
  Swap = 'Swap',
  Bridge = 'Bridge',
  Limit = 'Limit Order',
}

export type AllSwapTransactions = { [txHash: string]: TransactionDetails }

export enum TransactionStatus {
  COMPLETED = 'COMPLETED',
  CONFIRMED = 'CONFIRMED',
  CLAIMED = 'CLAIMED',
  REDEEM = 'REDEEM',
  PENDING = 'PENDING',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  LOADING = 'LOADING',
  FULFILLED = 'FULFILLED',
  EXPIRED = 'EXPIRED',
}

interface Token {
  value: number
  token: string
  chainId?: ChainId
  tokenAddress?: string
}

export interface SwapTransaction {
  type: TransactionTypes.Swap
  from: Token
  to: Token
  summary: string
  addedTime: number
  confirmedTime?: number
  hash: string
  status: string
  network?: ChainId
  swapProtocol?: string
  alternateReceiver?: string
}

export interface BridgeTransaction
  extends Omit<SwapTransaction, 'summary' | 'type' | 'addedTime' | 'swapProtocol' | 'alternateReceiver'> {
  type: TransactionTypes.Bridge
  pendingReason?: string
  bridgeId: BridgeList
  logs: BridgeTransactionLog[]
}

export type Transaction = SwapTransaction | BridgeTransaction | LimitOrderTransaction
