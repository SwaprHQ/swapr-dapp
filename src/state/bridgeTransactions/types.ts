import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { ChainId } from '@swapr/sdk'

import { L2ToL1MessageStatus } from '@arbitrum/sdk'

import { BridgeList } from '../../services/EcoBridge/EcoBridge.types'

export type BridgeTxnType =
  | 'deposit'
  | 'deposit-l1'
  | 'deposit-l2'
  | 'withdraw'
  | 'outbox'
  | 'approve'
  | 'connext-deposit'
  | 'connext-withdraw'
  | 'deposit-l2-auto-redeem'

export enum BridgeAssetType {
  ETH = 'ETH',
  ERC20 = 'ERC20',
  //ERC721
}

export type ArbitrumBridgeTxnsState = {
  [chainId: number]: {
    [txHash: string]: ArbitrumBridgeTxn
  }
}

export type ArbitrumBridgeTxn = {
  type: BridgeTxnType
  chainId: ChainId
  sender: string
  assetName: string
  assetType: BridgeAssetType
  assetAddressL1?: string
  assetAddressL2?: string
  value: string
  txHash: string
  blockNumber?: number
  timestampResolved?: number
  timestampCreated?: number
  receipt?: TransactionReceipt
  seqNum?: number
  partnerTxHash?: string
  batchIndex?: string
  batchNumber?: string
  l2ToL1MessageStatus?: L2ToL1MessageStatus
}

export enum BridgeTransactionStatus {
  FAILED = 'failed',
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  REDEEM = 'redeem',
  CLAIMED = 'claimed',
  LOADING = 'loading',
  CANCELLED = 'cancelled',
}

export type BridgeTransactionSummary = Pick<
  ArbitrumBridgeTxn,
  'txHash' | 'assetName' | 'batchIndex' | 'batchNumber' | 'timestampResolved' | 'assetAddressL1' | 'assetAddressL2'
> & {
  fromChainId: ChainId
  toChainId: ChainId
  log: BridgeTransactionLog[]
  status: BridgeTransactionStatus
  bridgeId: BridgeList
  pendingReason?: string
  fromValue: string
  toValue: string
  // timestampCreated: number
}

export type BridgeTransactionLog = Pick<ArbitrumBridgeTxn, 'txHash' | 'chainId'>
