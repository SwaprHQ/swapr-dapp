import { PayloadAction } from '@reduxjs/toolkit'

import { BridgeIds, ConnextIdList } from '../EcoBridge.types'
import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'

import { connextTransactionsAdapter } from './Connext.adapter'
import { ConnextBridgeState, ConnextTransaction, ConnextTransactionStatus } from './Connext.types'

const initialState: ConnextBridgeState = {
  transactions: connextTransactionsAdapter.getInitialState({}),
}
const createConnextSlice = (bridgeId: ConnextIdList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
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

const connextSlices: { [k in ConnextIdList]: ReturnType<typeof createConnextSlice> } = {
  connext: createConnextSlice(BridgeIds.CONNEXT),
}

type ConnextReducers = { [k in keyof typeof connextSlices]: ReturnType<typeof createConnextSlice>['reducer'] }

type ConnextActions = { [k in keyof typeof connextSlices]: ReturnType<typeof createConnextSlice>['actions'] }

type ConnextSliceExtract = {
  connextReducers: ConnextReducers
  connextActions: ConnextActions
}

export const { connextReducers, connextActions } = (Object.keys(connextSlices) as ConnextIdList[]).reduce(
  (total, key) => {
    total.connextReducers[key] = connextSlices[key].reducer
    total.connextActions[key] = connextSlices[key].actions
    return total
  },
  { connextActions: {}, connextReducers: {} } as ConnextSliceExtract
)
