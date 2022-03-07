import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { SocketBridgeState } from './Socket.types'
import { TokenList } from '@uniswap/token-lists'
import { SocketList, AsyncState, BridgingDetailsErrorMessage, BridgeList, BridgeDetails } from '../Omnibridge.types'
import { Route } from './api/generated'

const initialState: SocketBridgeState = {
  transactions: [],
  approvalData: {},
  txBridgingData: {},
  bridgingDetails: {},
  bridgingDetailsStatus: 'idle',
  listsStatus: 'idle',
  lists: {},
  routes: []
}

const createSocketSlice = (bridgeId: SocketList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
      setBridgeDetails: (state, action: PayloadAction<BridgeDetails>) => {
        const { gas, fee, estimateTime, receiveAmount } = action.payload

        //(store persist) crashing page without that code
        if (!state.bridgingDetails) {
          state.bridgingDetails = {}
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
      setTokenListsStatus: (state, action: PayloadAction<AsyncState>) => {
        state.listsStatus = action.payload
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
      },
      setBridgeDetailsStatus: (
        state,
        action: PayloadAction<{ status: AsyncState; errorMessage?: BridgingDetailsErrorMessage }>
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
      addTx: (
        state,
        action: PayloadAction<{
          txHash: string
          partnerTxHash?: string
          assetName: string
          value: string
          fromChainId: ChainId
          toChainId: ChainId
          bridgeId: BridgeList
          status?: 'success' | 'pending' | 'error'
          sender: string
        }>
      ) => {
        const { payload: txn } = action

        state.transactions.push(txn)
      },
      updateTx: (
        state,
        action: PayloadAction<{ txHash: string; partnerTxHash?: string; status?: 'success' | 'pending' | 'error' }>
      ) => {
        const { txHash, partnerTxHash, status } = action.payload
        const index = state.transactions.findIndex(tx => tx.txHash === txHash)
        const tx = state.transactions[index]

        if (status) {
          tx.status = status

          if (status === 'success') {
            tx.timestampResolved = Date.now()
          }
        }

        if (partnerTxHash) {
          tx.partnerTxHash = partnerTxHash
        }
      },
      setRoutes: (state, action: PayloadAction<Route[]>) => {
        state.routes = action.payload
      }
    }
  })

const socketSlices: { [k in SocketList]: ReturnType<typeof createSocketSlice> } = {
  socket: createSocketSlice('socket')
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
