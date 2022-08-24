import { ChainId } from '@swapr/sdk'

import { TokenInfo, TokenList } from '@uniswap/token-lists'

import { BridgeList, BridgingDetailsErrorMessage, SyncState } from '../EcoBridge.types'
import { Route } from './api/generated'

export type SocketTokenMap = {
  [key: string]: TokenInfo[]
}

export const SOCKET_PENDING_REASONS = {
  FROM_PENDING: 'Transaction on source chain has not been confirmed yet',
  TO_PENDING: 'Transaction on destination chain has not been confirmed yet',
}

export enum SocketTxStatus {
  FROM_PENDING = 'from-pending',
  TO_PENDING = 'to-pending',
  ERROR = 'error',
  CONFIRMED = 'confirmed',
}

export type SocketTx = {
  txHash: string
  partnerTxHash?: string
  assetName: string
  fromValue: string
  toValue: string
  fromChainId: ChainId
  toChainId: ChainId
  bridgeId: BridgeList
  timestampResolved?: number
  status: SocketTxStatus
  sender: string
  assetAddressL1: string
  assetAddressL2: string
}

export interface SocketBridgeState {
  transactions: SocketTx[]
  bridgingDetails: {
    gas?: string
    fee?: string
    estimateTime?: string
    receiveAmount?: string
  }
  bridgingDetailsStatus: SyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
  listsStatus: SyncState
  lists: { [id: string]: TokenList }
  approvalData: {
    chainId?: ChainId
    owner?: string
    allowanceTarget?: string
    tokenAddress?: string
    amount?: string
  }
  txBridgingData: {
    data?: string
    to?: string
  }
  routes: Route[]
  lastMetadataCt: number
}

type UserTxs = [{ steps: [{ protocolFees: { amount: string; feesInUsd: number; asset: { decimals: number } } }] }]

export function isFee(userTxs: any): userTxs is UserTxs {
  return userTxs.length && userTxs[0].steps.length && userTxs[0].steps
}

export enum SocketWrapDirection {
  FROM_A_NATIVE_TO_B_WRAPPED = 'FROM_A_NATIVE_TO_B_WRAPPED',
  FROM_B_WRAPPED_TO_A_NATIVE = 'FROM_B_WRAPPED_TO_A_NATIVE',
  FROM_B_NATIVE_TO_A_WRAPPED = 'FROM_B_NATIVE_TO_A_WRAPPED',
  FROM_A_WRAPPED_TO_B_NATIVE = 'FROM_A_WRAPPED_TO_B_NATIVE',
}
