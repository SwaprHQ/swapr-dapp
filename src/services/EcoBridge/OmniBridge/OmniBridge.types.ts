import { TransactionReceipt } from '@ethersproject/abstract-provider'
import { ChainId } from '@swapr/sdk'

import { EntityState } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { BigNumber } from 'ethers'

import { BridgeDetails, BridgingDetailsErrorMessage, SyncState } from '../EcoBridge.types'

export type ConfigPerChain = { [chainId: number]: string }

export enum Mode {
  DEDICATED_ERC20 = 'dedicated-erc20',
  ERC677 = 'erc677',
  ERC20 = 'erc20',
  NATIVE = 'NATIVE',
}

export type OmnibridgeTokenWithAddressAndChain = {
  chainId: ChainId
  address: string
}

export type OmnibridgeTokenSubgraph = {
  address: string
  chainId: ChainId
  decimals: number
  name: string
  symbol: string
}

export type OmnibridgeSubgraphResponse = {
  tokens: OmnibridgeTokenSubgraph[]
}
export type OmnibridgeToken = Pick<OmnibridgeTokenSubgraph, 'address' | 'chainId' | 'name' | 'decimals'> & {
  mode?: Mode
  mediator?: string
}

export type OmnibridgePairTokens = {
  fromToken: OmnibridgeToken & { amount: BigNumber; symbol?: string }
  toToken: OmnibridgeToken & { amount: BigNumber; symbol?: string }
}

export type OmnibridgeTransactionMessage = {
  messageData: string | null
  messageId: string
  signatures: string[] | null
  txHash?: string
}

export type OmniBridgeTransaction = {
  txHash: string
  assetName: string
  assetAddressL1?: string
  assetAddressL2?: string
  fromValue: string
  toValue: string
  fromChainId: ChainId
  toChainId: ChainId
  sender: string
  status: boolean | undefined | string
  timestampResolved?: number
  message?: OmnibridgeTransactionMessage
  receipt?: TransactionReceipt
  needsClaiming?: boolean
  partnerTxHash?: string
}
export type OmnibridgeRequest = {
  amount: string
  decimals: number
  message: { txHash: string; messageId: string; signatures: string[]; messageData: string }
  messageId: string
  symbol: string
  timestamp: string
  token: string
  txHash: string
  user: string
}
export type OmnibridgeExecution = {
  messageId: string
  status: boolean | undefined
  token: string
  txHash: string
  amount: string | null
}
export type OmnibridgeSubgraphRequests = {
  requests: OmnibridgeRequest[]
}
export type OmnibridgeSubgraphExecutions = {
  executions: OmnibridgeExecution[]
}

export type InitialState = {
  transactions: EntityState<OmniBridgeTransaction>
  lists: { [id: string]: TokenList }
  listsStatus: SyncState
  bridgingDetails: BridgeDetails
  bridgingDetailsStatus: SyncState
  lastMetadataCt: number
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
}

export type OmnibridgeConfig = {
  label: string
  homeChainId: number
  foreignChainId: number
  enableReversedBridge: boolean
  enableForeignCurrencyBridge: boolean
  foreignMediatorAddress: string
  homeMediatorAddress: string
  foreignAmbAddress: string
  homeAmbAddress: string
  foreignGraphName: string
  homeGraphName: string
  ambLiveMonitorPrefix: string
  claimDisabled: boolean
  tokensClaimDisabled: string[]
}
export type OmnibridgeOverrides = {
  [key: string]: {
    [chain: number]: {
      mediator: string
      from: string
      to: string
      mode: Mode
    }
  }
}
