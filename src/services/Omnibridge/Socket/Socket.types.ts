import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { BridgeList, AsyncState, BridgingDetailsErrorMessage } from '../Omnibridge.types'
import { TokenAsset, Route } from './api/generated'

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
    routes?: {
      tokenDetails: TokenAsset
      routes: Route[]
    }
  }
  bridgingReceiveAmount?: string
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
}
