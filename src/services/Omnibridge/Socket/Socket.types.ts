import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { BridgeList, AsyncState, BridgingDetailsErrorMessage } from '../Omnibridge.types'

export type Quote = {
  success: boolean
  result: {
    fromAsset: {
      address: string
      chainId: number
      decimals: number
      icon: string
      name: string
      symbol: string
    }
    toAsset: {
      chainId: number
      address: string
      decimals: number
      icon: string
      name: string
      symbol: string
    }
    toChainId: number
    fromChainId: number
    routes: Route[]
  }
}

export type Route = {
  chainGasBalances: {
    [n in number]: {
      hasGasBalance: false
      minGasBalance: string
    }
  }
  fromAmount: string
  routeId: string
  sender: string
  serviceTime: number
  toAmount: string
  totalGasFeesInUsd: number
  totalUserTx: number
  usedBridgeNames: string[]
  userTxs: any
}
export interface SocketBridgeState {
  transactions: {
    txHash: string
    assetName: string
    value: string
    fromChainId: ChainId
    toChainId: ChainId
    bridgeId: BridgeList
    timestampResolved?: number
  }[]
  bridgingDetails: {
    routes?: Route[]
  }
  bridgingReceiveAmount?: string
  bridgingDetailsStatus: AsyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
  listStatus: AsyncState
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
}
