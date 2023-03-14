import { ChainId, GetStatusRequest, QuoteRequest, StatusResponse } from '@lifi/sdk'

type LifiTokenInfo = {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name: string
  coinKey: string
  priceUSD: string
  logoURI: string
}
export interface LifiQuoteRequest extends Omit<QuoteRequest, 'fromAddress'> {
  requestId: number
}

export interface LifiTransactionStatus {
  statusRequest: GetStatusRequest
  statusResponse: StatusResponse
  account: string
  timeResolved?: number
}

export interface LifiStatusResponse extends StatusResponse {
  timeResolved?: number
}

export enum LifiTxStatus {
  PENDING = 'PENDING',
  INVALID = 'INVALID',
  ERROR = 'ERROR',
  FAILED = 'FAILED',
  DONE = 'DONE',
  NOT_FOUND = 'NOT_FOUND',
}

export const LIFI_PENDING_REASONS = {
  WAIT_SOURCE_CONFIRMATIONS: 'The bridge is waiting for additional confirmations.',
  WAIT_DESTINATION_TRANSACTION: 'Transaction on destination chain has not been confirmed yet.',
  BRIDGE_NOT_AVAILABLE: 'The bridge API / subgraph is temporarily unavailable, check back later.',
  CHAIN_NOT_AVAILABLE: 'The RPC for the source/destination chain is temporarily unavailable',
  NOT_PROCESSABLE_REFUND_NEEDED: 'The transfer cannot be completed, a refund is required.',
  REFUND_IN_PROGRESS:
    'The refund has been requested and its being processed (not all bridges will go through this state!)',
  UNKNOWN_ERROR: 'We cannot determine the status of the transfer.',
  COMPLETED: 'The transfer was successful.',
  PARTIAL:
    'The transfer was partially successful. This can happen for specific bridges like across , multichain or connext which may provide alternative tokens in case of low liquidity.',
  REFUNDED: ' The transfer was not successful and the sent token has been refunded',
}

export type LifiTokenMap = {
  [key: string]: LifiTokenInfo
}

export type GetTokenList = {
  fromChain: ChainId
  toChain: ChainId
}
