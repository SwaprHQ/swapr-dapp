import { ChainId } from '@swapr/sdk'
import { Store } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { AppState } from '../../state'
import { WrappedTokenInfo } from '../../state/lists/wrapped-token-info'

export type OmnibridgeProviders = {
  [key in ChainId]?: JsonRpcProvider | Web3Provider
}

export interface OmnibridgeConstructorParams {
  store: Store<AppState>
}

export interface SupportedChainsConfig {
  to: ChainId
  from: ChainId
  reverse: boolean
}

export interface OmnibridgeChangeHandler {
  account: string
  activeProvider: Web3Provider
  activeChainId: ChainId
  previousChainId?: ChainId
}

export interface OmnibridgeInitialEnv {
  staticProviders: OmnibridgeProviders
  store: Store<AppState>
}

export interface OmnibridgeChildBaseProps
  extends Partial<Omit<OmnibridgeChangeHandler, 'previousChainId'>>,
    Partial<OmnibridgeInitialEnv> {}

export interface OmnibridgeChildBaseInit extends OmnibridgeChangeHandler, OmnibridgeInitialEnv {}

export type SocketList = 'socket'
export type ArbitrumList = 'arbitrum:mainnet' | 'arbitrum:testnet'
export type BridgeList = ArbitrumList | SocketList
export type OptionalBridgeList = BridgeList | undefined

export interface OmnibridgeChildBaseConstructor {
  supportedChains: SupportedChainsConfig
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
export type AsyncState = 'idle' | 'loading' | 'ready' | 'failed'
export type BridgingDetailsErrorMessage = 'No available routes / details' | 'Bridge is not available now'
