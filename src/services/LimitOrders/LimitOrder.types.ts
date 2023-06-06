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

export interface TokenAmount<Token = ERC20Token> {
  token: Token
  /**
   * Amount in wei
   */
  amount: string
}

export interface LimitOrderBaseConstructor {
  userAddress: string
  receiverAddress: string
  sellToken: ERC20Token | NativeToken
  orderType?: 'partial' | 'full'
  kind?: 'buy' | 'sell'
  provider?: 'CoW' | '1inch'
  supportedChains: ChainId[]
}

export enum LimitOrderIds {
  COW = 'CoW',
  ONEINCH = '1inch',
}

export type LimitOrderProviders = { [key in LimitOrderIds]: LimitOrderBase }
