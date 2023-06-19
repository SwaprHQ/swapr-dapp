import { Web3Provider } from '@ethersproject/providers'
import { ChainId, Token } from '@swapr/sdk'

import { LimitOrderBase } from './LimitOrder.utils'

export interface MarketPrices {
  buy: number
  sell: number
}

export enum OrderExpiresInUnit {
  Minutes = 'minutes',
  Days = 'days',
}
export enum Kind {
  Buy = 'Buy',
  Sell = 'Sell',
}

export interface LimitOrderBaseConstructor {
  protocol: 'CoW' | '1inch'
  supportedChains: ChainId[]
  kind: Kind
  expiresAt: number
  sellToken: Token
  buyToken: Token
}

export type ProtocolContructor = Omit<LimitOrderBaseConstructor, 'kind' | 'expiresAt'>

export enum LimitOrderIds {
  COW = 'CoW',
  ONEINCH = '1inch',
}

export type LimitOrderProviders = { [key in LimitOrderIds]: LimitOrderBase }

export interface WalletData {
  account: string
  provider: Web3Provider
  activeChainId: ChainId
}

type EVMAddress = string

export interface LimitOrder {
  /**
   * The user Address.
   */
  userAddress: EVMAddress
  /**
   * receiver Address.
   */
  receiverAddress: EVMAddress
  /**
   * The sell token Address. The sellToken cannot be native token of the network.
   */
  sellToken: EVMAddress
  /**
   * The buy token address. The native token of the network is represented by `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`
   */
  buyToken: EVMAddress
  /**
   * The sell amount.
   */
  sellAmount: string
  /**
   * The buy amount.
   */
  buyAmount: string
  /**
   * Fee amount.
   */
  feeAmount: string
  /**
   * The buy amount.
   */
  limitPrice: string
  /**
   * Order timestamp as epoh seconds.
   */
  createdAt: number
  /**
   * Order expiration time in seconds.
   */
  expiresAt: number
  /**
   * Order kind
   */
  kind: Kind
  /**
   * Quote Id
   */
  quoteId?: number | null
}
