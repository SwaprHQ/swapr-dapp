import { createReducer } from '@reduxjs/toolkit'
import { RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'
import {
  addTransaction,
  checkedTransaction,
  clearAllTransactions,
  finalizeTransaction,
  SerializableTransactionReceipt,
} from './actions'

const now = () => new Date().getTime()

export enum SwapProtocol {
  COW = 'COW',
  SWAPR = 'SWAPR',
  UNISWAPV2 = 'UNISWAPV2',
  LEVINSWAP = 'LEVINSWAP',
  HONEYSWAP = 'HONEYSWAP',
  CURVE = 'CURVE',
}

/**
 * Receives a routing platform and returns the protocols in pairs of key/value
 * @param arg class to retrieve the Protocols from
 * @returns map of protocols
 */
export function getMapOfExchanges(arg: typeof RoutablePlatform) {
  const isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)
  if (!(isPrototypeOf(RoutablePlatform, arg) || arg === RoutablePlatform)) return {}
  const listOfProperties = Object.getOwnPropertyDescriptors(arg)
  const ofMap = Object.values(listOfProperties)
    //there is a 'prototype' property in this list of entries that is not writable, enumerable nor configurable
    .filter(el => el['value'] instanceof RoutablePlatform && el['enumerable'])
    // make it uppercase and get 1st word only
    .map(el => el.value.name.toUpperCase().replace(/ .*/, ''))
    //transform keys into the proper form to make the enum
    .map(el => [el, el])
  //console.info(Object.values(listOfProperties))
  const filteredEntries = Object.fromEntries(ofMap)
  return filteredEntries
}

export function createSwapProtocol() {
  const completeMap = { ...getMapOfExchanges(UniswapV2RoutablePlatform), ...getMapOfExchanges(RoutablePlatform) }
  // the elements in keys and values coincide
  const result = Object.values(completeMap).reduce<Record<string, string>>(
    (accumulator, current) => {
      return { ...accumulator, [current]: current }
    },
    {} // 👈️ initial value
  )
  console.info(result)
  return Object.freeze(result)
}

//function createSwapProtocolRecord():

//const myVar = ['abc'] as const
//type SwapP = typeof myVar[number]

//export const SwapProtocol: Readonly<Map<string, string>> = createSwapProtocol()

export interface TransactionDetails {
  hash: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
  claim?: { recipient: string }
  receipt?: SerializableTransactionReceipt
  lastCheckedBlockNumber?: number
  addedTime: number
  confirmedTime?: number
  from: string
  swapProtocol?: SwapProtocol
}

export interface TransactionState {
  [chainId: number]: {
    [txHash: string]: TransactionDetails
  }
}

export const initialState: TransactionState = {}

export default createReducer(initialState, builder =>
  builder
    .addCase(
      addTransaction,
      (transactions, { payload: { chainId, from, hash, approval, summary, claim, swapProtocol } }) => {
        if (transactions[chainId]?.[hash]) {
          throw Error('Attempted to add existing transaction.')
        }
        const txs = transactions[chainId] ?? {}
        txs[hash] = { hash, approval, summary, claim, from, addedTime: now(), swapProtocol }
        transactions[chainId] = txs
      }
    )
    .addCase(clearAllTransactions, (transactions, { payload: { chainId } }) => {
      if (!transactions[chainId]) return
      transactions[chainId] = {}
    })
    .addCase(checkedTransaction, (transactions, { payload: { chainId, hash, blockNumber } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      if (!tx.lastCheckedBlockNumber) {
        tx.lastCheckedBlockNumber = blockNumber
      } else {
        tx.lastCheckedBlockNumber = Math.max(blockNumber, tx.lastCheckedBlockNumber)
      }
    })
    .addCase(finalizeTransaction, (transactions, { payload: { hash, chainId, receipt } }) => {
      const tx = transactions[chainId]?.[hash]
      if (!tx) {
        return
      }
      tx.receipt = receipt
      tx.confirmedTime = now()
    })
)
