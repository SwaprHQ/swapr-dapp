import { Store } from '@reduxjs/toolkit'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'
import { AppState } from '../../state'

export type OmnibridgeProviders = {
  [key in ChainId]?: JsonRpcProvider | Web3Provider
}

export interface OmnibridgeConstructorParams {
  store: Store<AppState>
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

export type ArbitrumList = 'arbitrum:mainnet' | 'arbitrum:testnet'
export type BridgeList = ArbitrumList

export interface OmnibridgeChildBaseConstructor {
  supportedChains: {
    to: ChainId
    from: ChainId
    reverse: boolean
  }
  displayName: string
  bridgeId: BridgeList
}
