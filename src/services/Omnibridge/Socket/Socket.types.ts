import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { BridgeList, AsyncState, BridgingDetailsErrorMessage } from '../Omnibridge.types'
import { Route } from './api/generated'

export const SOCKET_PENDING_REASONS = {
  FROM_PENDING: 'Transaction on source chain has not been confirmed yet',
  TO_PENDING: 'Transaction on destination chain has not been confirmed yet'
}

export const SOCKET_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const DAI_ETHEREUM_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f'
export const DAI_ARBITRUM_ADDRESS = '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'

export type SocketTxStatus = 'from-pending' | 'to-pending' | 'error' | 'confirmed'

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
  bridgingDetailsStatus: AsyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
  listsStatus: AsyncState
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
  if (userTxs.length && userTxs[0].steps.length && userTxs[0].steps) {
    return true
  }
  return false
}
