import { ChainId } from '@swapr/sdk'
import { Store } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { AppState } from '../../state'
import { WrappedTokenInfo } from '../../state/lists/wrapped-token-info'
import { ListsState } from '../../state/lists/reducer'

export type EcoBridgeProviders = {
  [key in ChainId]?: JsonRpcProvider | Web3Provider
}

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

export type SocketList = 'socket'
export type ArbitrumList = 'arbitrum:mainnet' | 'arbitrum:testnet'
export type BridgeList = ArbitrumList | SocketList
export type OptionalBridgeList = BridgeList | undefined

export interface EcoBridgeChildBaseConstructor {
  supportedChains: SupportedChainsConfig[]
  displayName: string
  bridgeId: BridgeList
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
export type BridgingDetailsErrorMessage = 'No available routes / details' | 'Bridge is not available now'

export interface BridgeDetails {
  gas?: string
  estimateTime?: string
  fee?: string
  receiveAmount?: string
  requestId?: number
}

export type SupportedBridges = {
  name: string
  bridgeId: BridgeList
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

export type BridgeModalData = Pick<BridgeModalState, 'symbol' | 'typedValue' | 'fromChainId' | 'toChainId'>

export type WritableListsState = {
  [url: string]: ListsState['byUrl'][string]
}
