// eslint-disable-next-line no-restricted-imports
/**
 * @module limit-orders/api
 * @description LimitOrders API: a set of generic functions to create and manage limit orders.
 * This module API should not change.
 */

import type { Signer } from '@ethersproject/abstract-signer'
import { ChainId, CoWTrade } from '@swapr/sdk'

import contractNetworks from '@cowprotocol/contracts/networks.json'
import { OrderKind as CoWOrderKind } from '@cowprotocol/cow-sdk'
import type { UnsignedOrder } from '@cowprotocol/cow-sdk/dist/utils/sign'

import { LimitOrderKind, SerializableLimitOrder, SerializableSignedLimitOrder } from '../interfaces'

export interface SignLimitOrderParams {
  order: SerializableLimitOrder
  signer: Signer
  chainId: number
}

type GetLimitOrderQuoteParams = SignLimitOrderParams

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

const getCoWSdk = (chainId: number, signer: Signer) =>
  CoWTrade.getCowSdk(chainId, {
    signer,
  })

export async function getQuote({ order, signer, chainId }: GetLimitOrderQuoteParams) {
  const { buyToken, receiverAddress, userAddress, expiresAt, sellAmount, sellToken, kind } = order

  const cowSdk = getCoWSdk(chainId, signer)

  const cowQuote = await cowSdk.cowApi.getQuote({
    buyToken,
    sellToken,
    amount: sellAmount,
    validTo: expiresAt,
    kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
    receiver: receiverAddress,
    userAddress: userAddress,
  })

  return cowQuote
}

/**
 * Signs a limit order to produce a EIP712-compliant signature
 */
export async function signLimitOrder({
  order,
  signer,
  chainId,
}: SignLimitOrderParams): Promise<SerializableSignedLimitOrder> {
  // create an order via CoW API
  const cowSdk = getCoWSdk(chainId, signer)

  // Get feeAmount from CoW
  const { buyAmount, buyToken, receiverAddress, feeAmount, expiresAt, sellAmount, sellToken, kind } = order
  // const [baseToken, quoteToken] = kind === LimitOrderKind.SELL ? [sellToken, buyToken] : [buyToken, sellToken]

  // const cowQuote = await cowSdk.cowApi.getQuote({
  //   buyToken,
  //   sellToken,
  //   amount: sellAmount,
  //   validTo: expiresAt,
  //   kind: kind === LimitOrderKind.BUY ? CoWOrderKind.BUY : CoWOrderKind.SELL,
  //   receiver: receiverAddress,
  //   userAddress: userAddress,
  // })

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

/**
 * Returns the vault relayer contract address for the given chain.
 * ERC20 tokens must approve this address.
 * @param chainId The chain Id
 * @returns The vault relayer address
 */
export function getVaultRelayerAddress(chainId: ChainId) {
  const GPv2VaultRelayer = contractNetworks.GPv2VaultRelayer as Record<
    ChainId,
    Record<'transactionHash' | 'address', string>
  >

  return GPv2VaultRelayer[chainId]?.address
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
