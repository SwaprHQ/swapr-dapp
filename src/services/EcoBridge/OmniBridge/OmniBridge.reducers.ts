import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { PayloadAction } from '@reduxjs/toolkit'

import { OmniBridgeList } from '../EcoBridge.types'
import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'
import { omniTransactionsAdapter } from './OmniBridge.adapter'
import { OmnibridgeInitialState, OmniBridgeTransaction, OmnibridgeTransactionMessage } from './OmniBridge.types'

const initialState: OmnibridgeInitialState = {
  transactions: omniTransactionsAdapter.getInitialState({}),
}

export const createOmniBridgeSlice = (bridgeId: OmniBridgeList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
      addTransactions: (state, action: PayloadAction<OmniBridgeTransaction[]>) => {
        omniTransactionsAdapter.upsertMany(state.transactions, action.payload)
      },
      addTransaction: (state, action: PayloadAction<OmniBridgeTransaction>) => {
        const { payload: txn } = action

        if (!txn.txHash) return

        omniTransactionsAdapter.upsertOne(state.transactions, txn)
      },
      updateTransaction: (state, action: PayloadAction<{ txHash: string; receipt: TransactionReceipt }>) => {
        const { receipt, txHash } = action.payload

        omniTransactionsAdapter.updateOne(state.transactions, {
          id: txHash,
          changes: {
            receipt,
            timestampResolved: Date.now(),
          },
        })
      },
      updatePartnerTransaction: (
        state,
        action: PayloadAction<{
          txHash?: string
          partnerTxHash?: string
          message?: OmnibridgeTransactionMessage
          status?: string | boolean
        }>
      ) => {
        const { txHash, partnerTxHash, message, status } = action.payload
        if (!txHash) return

        if (partnerTxHash) {
          omniTransactionsAdapter.updateOne(state.transactions, {
            id: txHash,
            changes: {
              partnerTxHash,
            },
          })
        }

        if (message) {
          omniTransactionsAdapter.updateOne(state.transactions, {
            id: txHash,
            changes: {
              message,
            },
          })
        }
        if (status !== undefined) {
          omniTransactionsAdapter.updateOne(state.transactions, {
            id: txHash,
            changes: {
              status,
            },
          })
        }
      },
    },
  })

const omniBridgeSlices = {
  'omnibridge:eth-xdai': createOmniBridgeSlice('omnibridge:eth-xdai'),
}

type OmniBridgeReducers = { [k in keyof typeof omniBridgeSlices]: ReturnType<typeof createOmniBridgeSlice>['reducer'] }

type OmniBridgeActions = { [k in keyof typeof omniBridgeSlices]: ReturnType<typeof createOmniBridgeSlice>['actions'] }

type OmniBridgeSliceExtract = {
  omniBridgeReducers: OmniBridgeReducers
  omniBridgeActions: OmniBridgeActions
}

export const { omniBridgeReducers, omniBridgeActions } = (Object.keys(omniBridgeSlices) as Array<
  keyof typeof omniBridgeSlices
>).reduce(
  (total, key) => {
    total.omniBridgeReducers[key] = omniBridgeSlices[key].reducer
    total.omniBridgeActions[key] = omniBridgeSlices[key].actions
    return total
  },
  { omniBridgeReducers: {}, omniBridgeActions: {} } as OmniBridgeSliceExtract
)
