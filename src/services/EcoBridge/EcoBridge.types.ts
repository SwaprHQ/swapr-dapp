import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { AppState } from '../../state'
import { ListsState } from '../../state/lists/reducer'
import { WrappedTokenInfo } from '../../state/lists/wrapped-token-info'

import { EcoBridgeChildBase } from './EcoBridge.utils'

export enum BridgeIds {
  ARBITRUM_MAINNET = 'arbitrum:mainnet',
  ARBITRUM_TESTNET = 'arbitrum:testnet',
  CONNEXT = 'connext',
  LIFI = 'lifi',
  OMNIBRIDGE = 'omnibridge:eth-xdai',
  SOCKET = 'socket',
  XDAI = 'xdai',
}

export interface EcoBridgeChildBaseState {
  lists: { [id: string]: TokenList }
  listsStatus: SyncState
  bridgingDetails: BridgeDetails
  bridgingDetailsStatus: SyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
  lastMetadataCt: number
}

export type EcoBridgeProviders = {
  [key in ChainId]?: JsonRpcProvider | Web3Provider
}

export type Bridges = { [k in BridgeIdList]: EcoBridgeChildBase }

export interface EcoBridgeConstructorParams {
  store: Store<AppState>
}

export interface SupportedChainsConfig {
  to: ChainId
  from: ChainId
}

export interface EcoBridgeChangeHandler {
  account: string
  activeProvider: Web3Provider
  activeChainId: ChainId
  previousChainId?: ChainId
}

export interface EcoBridgeInitialEnv {
  staticProviders: EcoBridgeProviders
  store: Store<AppState>
}

export interface EcoBridgeChildBaseProps
  extends Partial<Omit<EcoBridgeChangeHandler, 'previousChainId'>>,
    Partial<EcoBridgeInitialEnv> {}

export interface EcoBridgeChildBaseInit extends EcoBridgeChangeHandler, EcoBridgeInitialEnv {}

export type BridgeIdList =
  | ArbitrumIdList
  | ConnextIdList
  | LifiIdList
  | OmniBridgeIdList
  | SocketIdList
  | XdaiBridgeIdList
export type ArbitrumIdList = BridgeIds.ARBITRUM_MAINNET | BridgeIds.ARBITRUM_TESTNET
export type ConnextIdList = BridgeIds.CONNEXT
export type LifiIdList = BridgeIds.LIFI
export type OmniBridgeIdList = BridgeIds.OMNIBRIDGE
export type SocketIdList = BridgeIds.SOCKET
export type XdaiBridgeIdList = BridgeIds.XDAI
export type OptionalBridgeIdList = BridgeIdList | undefined

export interface EcoBridgeConfig {
  id: BridgeIdList
  name: string
  url: string
}

export interface EcoBridgeChildBaseConstructor {
  supportedChains: SupportedChainsConfig[]
  displayName: string
  displayUrl: string
  bridgeId: BridgeIdList
}

export interface TokenMap {
  [chainId: number]: Readonly<{
    [tokenAddress: string]: {
      token: WrappedTokenInfo
      list: TokenList
    }
  }>
}

export enum SyncState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  FAILED = 'failed',
}
export type BridgingDetailsErrorMessage = string

export interface BridgeDetails {
  gas?: string
  estimateTime?: string
  fee?: string
  receiveAmount?: string
  requestId?: number
  routeId?: string
}

export type SupportedBridges = {
  name: string
  url: string
  bridgeId: BridgeIdList
  status: SyncState
  details: BridgeDetails
  errorMessage?: BridgingDetailsErrorMessage
}

export enum BridgeTxsFilter {
  NONE = 'NONE',
  COLLECTABLE = 'COLLECTABLE',
  RECENT = 'RECENT',
}

export enum BridgeModalStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  CLOSED = 'CLOSED',
  INITIATED = 'INITIATED',
  ERROR = 'ERROR',
  COLLECTING = 'COLLECTING',
  DISCLAIMER = 'DISCLAIMER',
}

export interface BridgeModalState {
  readonly status: BridgeModalStatus
  readonly symbol: string | undefined
  readonly typedValue: string
  readonly fromChainId: ChainId
  readonly toChainId: ChainId
  readonly error?: string
  readonly disclaimerText?: string
}

export type BridgeModalData = Pick<BridgeModalState, 'typedValue' | 'fromChainId' | 'toChainId'> & {
  symbol: string
}

export type WritableListsState = {
  [url: string]: ListsState['byUrl'][string]
}
