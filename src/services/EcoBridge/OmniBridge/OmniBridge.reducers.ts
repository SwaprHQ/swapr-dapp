import { TransactionReceipt } from '@ethersproject/abstract-provider'

import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { BridgeDetails, BridgingDetailsErrorMessage, OmniBridgeList, SyncState } from '../EcoBridge.types'
import { omniTransactionsAdapter } from './OmniBridge.adapter'
import { InitialState, OmniBridgeTransaction, OmnibridgeTransactionMessage } from './OmniBridge.types'

const initialState: InitialState = {
  transactions: omniTransactionsAdapter.getInitialState({}),
  lists: {},
  listsStatus: SyncState.IDLE,
  bridgingDetails: {},
  bridgingDetailsStatus: SyncState.IDLE,
  lastMetadataCt: 0,
}

export const createOmniBridgeSlice = (bridgeId: OmniBridgeList) =>
  createSlice({
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
      setBridgeDetails: (state, action: PayloadAction<BridgeDetails>) => {
        const { gas, fee, estimateTime, receiveAmount, requestId } = action.payload

        //(store persist) crashing page without that code
        if (!state.bridgingDetails) {
          state.bridgingDetails = {}
        }

        if (requestId !== state.lastMetadataCt) {
          if (state.bridgingDetailsStatus === SyncState.FAILED) return
          state.bridgingDetailsStatus = SyncState.LOADING
          return
        } else {
          state.bridgingDetailsStatus = SyncState.READY
        }

        state.bridgingDetails = {
          gas,
          fee,
          estimateTime,
          receiveAmount,
        }
      },
      setBridgeDetailsStatus: (
        state,
        action: PayloadAction<{ status: SyncState; errorMessage?: BridgingDetailsErrorMessage }>
      ) => {
        const { status, errorMessage } = action.payload

        state.bridgingDetailsStatus = status

        if (errorMessage) {
          state.bridgingDetailsErrorMessage = errorMessage
        }
      },
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
      setTokenListsStatus: (state, action: PayloadAction<SyncState>) => {
        state.listsStatus = action.payload
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
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

export const { omniBridgeReducers, omniBridgeActions } = (
  Object.keys(omniBridgeSlices) as Array<keyof typeof omniBridgeSlices>
).reduce(
  (total, key) => {
    total.omniBridgeReducers[key] = omniBridgeSlices[key].reducer
    total.omniBridgeActions[key] = omniBridgeSlices[key].actions
    return total
  },
  { omniBridgeReducers: {}, omniBridgeActions: {} } as OmniBridgeSliceExtract
)
