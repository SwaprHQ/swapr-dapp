import { type ChainId } from '@swapr/sdk'

import { type BridgeList } from '../../services/EcoBridge/EcoBridge.types'
import { type BridgeTransactionLog } from '../../state/bridgeTransactions/types'
import { type TransactionDetails } from '../../state/transactions/reducer'
import { type LimitOrderTransaction } from '../Swap/LimitOrderBox/utils/hooks'

export enum TransactionType {
  Swap = 'Swap',
  Bridge = 'Bridge',
  LimitOrder = 'Limit Order',
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
  OPEN = 'OPEN',
}

interface Token {
  value: number
  symbol: string
  chainId?: ChainId
  tokenAddress?: string
}

export interface SwapTransaction {
  /**
   * The timestamp of the transaction broadcast to the network. This is used to sort the transactions.
   */
  type: TransactionType.Swap
  sellToken: Token
  buyToken: Token
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
  type: TransactionType.Bridge
  pendingReason?: string
  bridgeId: BridgeList
  logs: BridgeTransactionLog[]
}

export type TradingTransaction = SwapTransaction | BridgeTransaction
export type Transaction = SwapTransaction | BridgeTransaction | LimitOrderTransaction
