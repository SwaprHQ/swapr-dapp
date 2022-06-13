import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { BridgeDetails, BridgingDetailsErrorMessage, ConnextList, SyncState } from '../EcoBridge.types'
import { connextTransactionsAdapter } from './Connext.adapter'
import { ConnextBridgeState, ConnextTransaction, ConnextTransactionStatus } from './Connext.types'

const initialState: ConnextBridgeState = {
  transactions: connextTransactionsAdapter.getInitialState({}),
  bridgingDetails: {},
  bridgingDetailsStatus: SyncState.IDLE,
  listsStatus: SyncState.IDLE,
  lists: {},
  lastMetadataCt: 0,
}
const createConnextSlice = (bridgeId: ConnextList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
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

        state.bridgingDetails.gas = gas

        state.bridgingDetails.fee = fee

        state.bridgingDetails.estimateTime = estimateTime

        state.bridgingDetails.receiveAmount = receiveAmount
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
      addTransactions: (state, action: PayloadAction<ConnextTransaction[]>) => {
        connextTransactionsAdapter.upsertMany(state.transactions, action.payload)
      },
      addTransaction: (state, action: PayloadAction<ConnextTransaction>) => {
        connextTransactionsAdapter.upsertOne(state.transactions, action.payload)
      },
      updateTransactionAfterCollect: (state, action: PayloadAction<string>) => {
        connextTransactionsAdapter.updateOne(state.transactions, {
          id: action.payload,
          changes: {
            status: ConnextTransactionStatus.PENDING,
            fulfillPending: true,
          },
        })
      },
    },
  })

const connextSlices: { [k in ConnextList]: ReturnType<typeof createConnextSlice> } = {
  connext: createConnextSlice('connext'),
}

type ConnextReducers = { [k in keyof typeof connextSlices]: ReturnType<typeof createConnextSlice>['reducer'] }

type ConnextActions = { [k in keyof typeof connextSlices]: ReturnType<typeof createConnextSlice>['actions'] }

type ConnextSliceExtract = {
  connextReducers: ConnextReducers
  connextActions: ConnextActions
}

export const { connextReducers, connextActions } = (Object.keys(connextSlices) as ConnextList[]).reduce(
  (total, key) => {
    total.connextReducers[key] = connextSlices[key].reducer
    total.connextActions[key] = connextSlices[key].actions
    return total
  },
  { connextActions: {}, connextReducers: {} } as ConnextSliceExtract
)
