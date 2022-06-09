import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { BridgeList, SyncState, BridgingDetailsErrorMessage } from '../EcoBridge.types'
import { Route } from './api/generated'

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
  value: string
  fromChainId: ChainId
  toChainId: ChainId
  bridgeId: BridgeList
  timestampResolved?: number
  status: SocketTxStatus
  sender: string
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
