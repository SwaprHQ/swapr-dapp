/**
 * @module limit-orders/api
 * @description LimitOrders API: a set of generic functions to create and manage limit orders.
 * This module API should not change.
 */

import type { Signer } from '@ethersproject/abstract-signer'
import { CoWTrade } from '@swapr/sdk'

import { OrderKind as CoWOrderKind } from '@cowprotocol/cow-sdk'
import type { UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign'

import { LimitOrderKind, SerializableLimitOrder, SerializableSignedLimitOrder } from '../interfaces'

export interface SignLimitOrderParams {
  order: SerializableLimitOrder
  signer: Signer
  chainId: number
}

// const quoteResponse = await fetch(
//   cowSdk.cowApi.API_BASE_URL[chainId as keyof typeof cowSdk.cowApi.API_BASE_URL] +
//     '/v1/feeAndQuote/' +
//     kind.toLowerCase() +
//     '?' +
//     new URLSearchParams({
//       sellToken,
//       buyToken,
//       sellAmountBeforeFee: sellAmount,
//     })
// ).then(res => res.json())

// const feeAmount = quoteResponse.fee.amount

/**
 * Signs a limit order to produce a EIP712-compliant signature
 */
export async function signLimitOrder({
  order,
  signer,
  chainId,
}: SignLimitOrderParams): Promise<SerializableSignedLimitOrder> {
  // create an order via CoW API
  const cowSdk = CoWTrade.getCowSdk(chainId, {
    signer,
  })

  // Get feeAmount from CoW
  const { buyAmount, buyToken, receiverAddress, userAddress, expiresAt, sellAmount, sellToken, kind } = order
  // const [baseToken, quoteToken] = kind === LimitOrderKind.SELL ? [sellToken, buyToken] : [buyToken, sellToken]

  const cowQuote = await cowSdk.cowApi.getQuote({
    buyToken,
    sellToken,
    amount: sellAmount,
    validTo: expiresAt,
    kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
    receiver: receiverAddress,
    userAddress: userAddress,
  })

  const feeAmount = '1'

  const cowOrder: Omit<UnsignedOrder, 'appData'> = {
    buyAmount,
    buyToken,
    sellAmount,
    sellToken,
    feeAmount, // from CoW APIs
    receiver: receiverAddress, // the account that will receive the order
    validTo: expiresAt,
    kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
    partiallyFillable: false,
  }

  const signedResult = await cowSdk.signOrder(cowOrder)

  if (!signedResult || !signedResult.signature) {
    throw new Error('Failed to sign order')
  }

  return {
    ...order,
    feeAmount, // from CoW APIs
    signature: signedResult.signature,
    signingScheme: signedResult.signingScheme,
  }
}

export interface SubmitLimitOrderParams {
  order: SerializableSignedLimitOrder
  signer: Signer
  chainId: number
}

/**
 * Submits a limit order, producing a order ID hash.
 */
export async function submitLimitOrder({ order, signer, chainId }: SubmitLimitOrderParams): Promise<string> {
  // create an order via CoW API
  const cowSdk = CoWTrade.getCowSdk(chainId, {
    signer,
  })

  const {
    buyAmount,
    buyToken,
    receiverAddress,
    expiresAt,
    sellAmount,
    sellToken,
    kind,
    signature,
    signingScheme,
    userAddress,
    feeAmount,
  } = order

  return cowSdk.cowApi.sendOrder({
    order: {
      buyAmount,
      buyToken,
      sellAmount,
      sellToken,
      feeAmount,
      kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
      receiver: receiverAddress, // the account that will receive the order
      validTo: expiresAt,
      partiallyFillable: false, // @todo: support partially fillable orders
      signature,
      signingScheme,
    },
    owner: userAddress,
  })
}
