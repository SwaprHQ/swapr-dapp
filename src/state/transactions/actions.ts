import { ChainId } from '@swapr/sdk'

import { createAction } from '@reduxjs/toolkit'

export interface SerializableGeneralTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: 0 | 1
}

export interface SerializableSwapTransactionReceipt {
  hash: string
  status?: 0 | 1
}

export type SerializableTransactionReceipt = SerializableGeneralTransactionReceipt | SerializableSwapTransactionReceipt

export const addTransaction = createAction<{
  chainId: ChainId
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  claim?: { recipient: string }
  summary?: string
  swapProtocol?: string
}>('transactions/addTransaction')
export const clearAllTransactions = createAction<{ chainId: ChainId }>('transactions/clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: ChainId
  hash: string
  receipt: SerializableTransactionReceipt
}>('transactions/finalizeTransaction')
export const checkedTransaction = createAction<{
  chainId: ChainId
  hash: string
  blockNumber: number
}>('transactions/checkedTransaction')
