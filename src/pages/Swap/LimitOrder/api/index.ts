// eslint-disable-next-line no-restricted-imports
/**
 * @module limit-orders/api
 * @description LimitOrders API: a set of generic functions to create and manage limit orders.
 * This module API should not change.
 */

import type { Signer } from '@ethersproject/abstract-signer'
import { ChainId, CoWTrade } from '@swapr/sdk'

import { SigningScheme } from '@cowprotocol/contracts'
import { OrderKind as CoWOrderKind } from '@cowprotocol/cow-sdk'

import { LimitOrderKind, SerializableSignedLimitOrder } from '../../LimitOrderBox/interfaces'

// import { LimitOrderKind, SerializableSignedLimitOrder } from '../interfaces'

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
  if (signature) {
    try {
      await cowSdk.cowApi.sendSignedOrderCancellation({
        //@ts-ignore
        chainId,
        cancellation: { orderUid: uid, signature, signingScheme: SigningScheme.EIP712 },
      })
      const response = await cowSdk.cowApi.getOrder(uid)
      if (response) {
        return response.status
      }
    } catch (error) {
      console.error('There was an error!', error)
    }
  }
}
