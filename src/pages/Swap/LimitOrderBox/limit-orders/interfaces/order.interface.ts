import { SigningResult } from '@cowprotocol/cow-sdk/dist/utils/sign'
/**
 * @description An EVM-compatible address
 */
export type EVMAddress = string

/**
 * The native token of the network. e.g. ETH, OETH, AETH, etc.
 */
export const nativeTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export enum LimitOrderKind {
  /**
   * A sell order.
   */
  SELL = 'sell',
  /**
   * A buy order.
   */
  BUY = 'buy',
}

/**
 * Serializable Limit Order interface.
 */
export interface SerializableLimitOrder {
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
  kind: LimitOrderKind
}

/**
 * Serializable Limit Order interface.
 */
export interface SerializableSignedLimitOrder extends SerializableLimitOrder {
  signature: string
  signingScheme: SigningResult['signingScheme']
}

export enum OrderExpiresInUnit {
  Minutes = 'minutes',
  Days = 'days',
}
