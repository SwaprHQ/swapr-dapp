import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { SocketBridgeState, SocketTx, SocketTxStatus } from './Socket.types'
import { TokenList } from '@uniswap/token-lists'
import { SocketList, SyncState, BridgingDetailsErrorMessage, BridgeDetails } from '../EcoBridge.types'
import { Route } from './api/generated'

const initialState: SocketBridgeState = {
  transactions: [],
  approvalData: {},
  txBridgingData: {},
  bridgingDetails: {},
  bridgingDetailsStatus: SyncState.IDLE,
  listsStatus: SyncState.IDLE,
  lists: {},
  routes: [],
  lastMetadataCt: 0,
}

const createSocketSlice = (bridgeId: SocketList) =>
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

        if (gas) {
          state.bridgingDetails.gas = gas
        }
        if (fee) {
          state.bridgingDetails.fee = fee
        }
        if (estimateTime) {
          state.bridgingDetails.estimateTime = estimateTime
        }
        if (receiveAmount) {
          state.bridgingDetails.receiveAmount = receiveAmount
        }
      },
      setTokenListsStatus: (state, action: PayloadAction<SyncState>) => {
        state.listsStatus = action.payload
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
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
      setApprovalData: (
        state,
        action: PayloadAction<{
          chainId: ChainId
          owner: string
          allowanceTarget: string
          tokenAddress: string
          amount: string
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
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
    },
  })

const socketSlices: { [k in SocketList]: ReturnType<typeof createSocketSlice> } = {
  socket: createSocketSlice('socket'),
}

type SocketReducers = { [k in keyof typeof socketSlices]: ReturnType<typeof createSocketSlice>['reducer'] }

type SocketActions = { [k in keyof typeof socketSlices]: ReturnType<typeof createSocketSlice>['actions'] }

type SocketSliceExtract = {
  socketReducers: SocketReducers
  socketActions: SocketActions
}

export const { socketReducers, socketActions } = (Object.keys(socketSlices) as SocketList[]).reduce(
  (total, key) => {
    total.socketReducers[key] = socketSlices[key].reducer
    total.socketActions[key] = socketSlices[key].actions
    return total
  },
  { socketActions: {}, socketReducers: {} } as SocketSliceExtract
)
