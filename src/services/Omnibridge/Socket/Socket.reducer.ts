import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { SocketBridgeState } from './Socket.types'
import { SocketList, AsyncState, BridgingDetailsErrorMessage, BridgeList } from '../Omnibridge.types'
import { TokenAsset, Route } from './api/generated'

const initialState: SocketBridgeState = {
  transactions: [],
  approvalData: {},
  txBridgingData: {},
  bridgingDetails: {},
  bridgingDetailsStatus: 'idle',
  listStatus: 'idle',
  lists: {}
}

const createSocketSlice = (bridgeId: SocketList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
      setBridgeDetails: (
        state,
        action: PayloadAction<{
          tokenDetails: TokenAsset
          routes: Route[]
        }>
      ) => {
        console.log(action.payload)
        const { routes, tokenDetails } = action.payload
        if (routes && tokenDetails) {
          state.bridgingDetails.routes = { tokenDetails, routes }
        }
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
      setBridgingReceiveAmount: (state, action: PayloadAction<string>) => {
        state.bridgingReceiveAmount = action.payload
      },
      addTx: (
        state,
        action: PayloadAction<{
          txHash: string
          assetName: string
          value: string
          fromChainId: ChainId
          toChainId: ChainId
          bridgeId: BridgeList
        }>
      ) => {
        const { payload: txn } = action

        state.transactions.push(txn)
      },
      updateTx: (state, action: PayloadAction<{ txHash: string }>) => {
        const index = state.transactions.findIndex(tx => tx.txHash === action.payload.txHash)

        state.transactions[index].timestampResolved = Date.now()
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
