import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SocketList, AsyncState } from '../Omnibridge.types'

interface SocketBridgeState {
  transactions: any
  routes: {
    chainGasBalances: {
      [n in number]: {
        hasGasBalance: false
        minGasBalance: string
      }
    }
    fromAmount: string
    routeId: string
    sender: string
    serviceTime: number
    toAmount: string
    totalGasFeesInUsd: number
    totalUserTx: number
    usedBridgeNames: string[]
    userTxs: any
  }[]
  routesStatus: AsyncState
  approvalData: any
  txData: any
}

const initialState: SocketBridgeState = {
  transactions: {},
  routes: [],
  approvalData: {},
  txData: {},
  routesStatus: 'loading'
}

const createSocketSlice = (bridgeId: SocketList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
      setRoute(
        state,
        action: PayloadAction<
          {
            chainGasBalances: {
              [n in number]: {
                hasGasBalance: false
                minGasBalance: string
              }
            }
            fromAmount: string
            routeId: string
            sender: string
            serviceTime: number
            toAmount: string
            totalGasFeesInUsd: number
            totalUserTx: number
            usedBridgeNames: string[]
            userTxs: any //TODO
          }[]
        >
      ) {
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
