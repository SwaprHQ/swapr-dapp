// eslint-disable-next-line no-restricted-imports
/**
 * @module limit-orders/api
 * @description LimitOrders API: a set of generic functions to create and manage limit orders.
 * This module API should not change.
 */

import type { Signer } from '@ethersproject/abstract-signer'
import { ChainId, CoWTrade } from '@swapr/sdk'

import { OrderKind as CoWOrderKind } from '@cowprotocol/cow-sdk'

import { LimitOrderKind, SerializableSignedLimitOrder } from '../interfaces'

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
    quoteId,
  } = order

  return cowSdk.cowApi.sendOrder({
    order: {
      quoteId,
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

export async function getOwnerOrders(chainId: ChainId, owner: string) {
  const cowSdk = CoWTrade.getCowSdk(chainId)
  return cowSdk.cowApi.getOrders({ owner })
}

export async function deleteOpenOrders(chainId: ChainId, uid: string, signer: Signer) {
  const cowSdk = CoWTrade.getCowSdk(chainId, { signer })
  const { signature } = await cowSdk.signOrderCancellation(uid)

  // @ts-ignore POLYGON is not supported now by CoW SDK
  const url = `${cowSdk.cowApi.API_BASE_URL[chainId]}/v1/orders/${uid}`
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ signature, signingScheme: 'eip712' }),
    })
    const data = await response.json()
    if (!response.ok) {
      // get error message from body or default to response status
      const error = (data && data.message) || response.status
      return Promise.reject(error)
    }
    return data
  } catch (error) {
    console.error('There was an error!', error)
  }
}
