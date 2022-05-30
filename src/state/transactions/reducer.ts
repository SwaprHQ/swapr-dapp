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

export function getMapOfExchanges(arg: any): Record<string, string> {
  const isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)
  if (!(isPrototypeOf(RoutablePlatform, arg) || arg === RoutablePlatform)) return {}
  const listOfProperties = Object.getOwnPropertyDescriptors(arg)
  const ofMap = Object.values(listOfProperties)
    //there is a 'prototype' property in this list of entries that is not writable, enumerable nor configurable
    .filter(el => el['value'] instanceof RoutablePlatform && el['enumerable'])
    // make it uppercase and get 1st word only
    .map(el => el.value.name.toUpperCase().replace(/ .*/, ''))
    .reduce<Record<string, string>>((accumulator, current) => ({ ...accumulator, [current]: current }), {})
  //console.info(Object.values(listOfProperties))
  return ofMap
}

export function createSwapProtocol(): Readonly<Record<string, string>> {
  const completeMap: Record<string, string> = {
    ...getMapOfExchanges(UniswapV2RoutablePlatform),
    ...getMapOfExchanges(RoutablePlatform),
  }
  return Object.freeze(completeMap)
}

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
