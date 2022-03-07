import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { BridgeList, AsyncState, BridgingDetailsErrorMessage } from '../Omnibridge.types'
import { Route } from './api/generated'

export const SOCKET_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export type SocketTx = {
  txHash: string
  partnerTxHash?: string
  assetName: string
  value: string
  fromChainId: ChainId
  toChainId: ChainId
  bridgeId: BridgeList
  timestampResolved?: number
  status?: 'pending' | 'success' | 'error'
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
}

type UserTxs = [{ steps: [{ protocolFees: { amount: string; feesInUsd: number } }] }]

export function isFee(userTxs: any): userTxs is UserTxs {
  if (userTxs.length && userTxs[0].steps.length && userTxs[0].steps) {
    return true
  }
  return false
}
