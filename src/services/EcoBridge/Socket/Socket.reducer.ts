import { ChainId } from '@swapr/sdk'

import { PayloadAction } from '@reduxjs/toolkit'

import { BridgeIds, SocketIdList } from '../EcoBridge.types'
import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'

import { Route } from './api/generated'
import { SocketBridgeState, SocketTx, SocketTxStatus } from './Socket.types'

const initialState: SocketBridgeState = {
  transactions: [],
  approvalData: {},
  txBridgingData: {},
  routes: [],
  assetDecimals: 18,
}

const createSocketSlice = (bridgeId: SocketIdList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
      setApprovalData: (
        state,
        action: PayloadAction<{
          chainId?: ChainId
          owner?: string
          allowanceTarget?: string
          tokenAddress?: string
          amount?: string
        }>
      ) => {
        state.approvalData = action.payload
      },
      setTxBridgingData: (
        state,
        action: PayloadAction<{
          data: string
          to: string
        }>
      ) => {
        state.txBridgingData = action.payload
      },
      addTx: (state, action: PayloadAction<Omit<SocketTx, 'partnerTxHash' | 'status' | 'timestampResolved'>>) => {
        const { payload: txn } = action

        state.transactions.push({ ...txn, status: SocketTxStatus.FROM_PENDING })
      },
      updateTx: (state, action: PayloadAction<Pick<SocketTx, 'txHash' | 'partnerTxHash' | 'status'>>) => {
        const { txHash, partnerTxHash, status } = action.payload
        const index = state.transactions.findIndex(tx => tx.txHash === txHash)
        const tx = state.transactions[index]

        if (partnerTxHash) {
          tx.partnerTxHash = partnerTxHash
          tx.timestampResolved = Date.now()
        }

        if (status) {
          tx.status = status
        }
      },
      setRoutes: (state, action: PayloadAction<Route[]>) => {
        state.routes = action.payload
      },
      setToAssetDecimals: (state, action: PayloadAction<number | undefined>) => {
        state.assetDecimals = action.payload ?? 18
      },
    },
  })

const socketSlices: { [k in SocketIdList]: ReturnType<typeof createSocketSlice> } = {
  socket: createSocketSlice(BridgeIds.SOCKET),
}

type SocketReducers = { [k in keyof typeof socketSlices]: ReturnType<typeof createSocketSlice>['reducer'] }

type SocketActions = { [k in keyof typeof socketSlices]: ReturnType<typeof createSocketSlice>['actions'] }

type SocketSliceExtract = {
  socketReducers: SocketReducers
  socketActions: SocketActions
}

export const { socketReducers, socketActions } = (Object.keys(socketSlices) as SocketIdList[]).reduce(
  (total, key) => {
    total.socketReducers[key] = socketSlices[key].reducer
    total.socketActions[key] = socketSlices[key].actions
    return total
  },
  { socketActions: {}, socketReducers: {} } as SocketSliceExtract
)
