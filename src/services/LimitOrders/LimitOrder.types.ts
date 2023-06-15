import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { LimitOrderBase } from './LimitOrder.utils'

export interface TokenBase {
  address: string
  decimals: number
  symbol: string
  chainId: number
  name?: string
}

export type NativeToken = TokenBase & {
  isToken: false
  isNative: true
}

export type ERC20Token = TokenBase & {
  isNative: false
  isToken: true
}

export type Token = NativeToken | ERC20Token

export interface LimitOrderBaseConstructor {
  protocol: 'CoW' | '1inch'
  supportedChains: ChainId[]
  kind: 'buy' | 'sell'
  expiresAt: number
}

export type ProtocolContructor = Omit<LimitOrderBaseConstructor, 'kind' | 'expiresAt'>

export enum LimitOrderIds {
  COW = 'CoW',
  ONEINCH = '1inch',
}

export type LimitOrderProviders = { [key in LimitOrderIds]: LimitOrderBase }

export interface LimitOrderChangeHandler {
  account: string
  activeProvider: Web3Provider
  activeChainId: ChainId
}
