import { ChainId } from '@swapr/sdk'

import { PayloadAction } from '@reduxjs/toolkit'

import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'
import { LifiList } from './../EcoBridge.types'

type LifiBridgeState = {
  transactions: []
}

const initialState: LifiBridgeState = {
  transactions: [],
}

const createLifiSlice = (bridgeId: LifiList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
      // setApprovalData: (
      //   state,
      //   action: PayloadAction<{
      //     chainId?: ChainId
      //     owner?: string
      //     allowanceTarget?: string
      //     tokenAddress?: string
      //     amount?: string
      //   }>
      // ) => {
      //   state.approvalData = action.payload
      // },
      // setTxBridgingData: (
      //   state,
      //   action: PayloadAction<{
      //     data: string
      //     to: string
      //   }>
      // ) => {
      //   state.txBridgingData = action.payload
      // },
      // addTx: (state, action: PayloadAction<Omit<SocketTx, 'partnerTxHash' | 'status' | 'timestampResolved'>>) => {
      //   const { payload: txn } = action
      //   state.transactions.push({ ...txn, status: SocketTxStatus.FROM_PENDING })
      // },
      // updateTx: (state, action: PayloadAction<Pick<SocketTx, 'txHash' | 'partnerTxHash' | 'status'>>) => {
      //   const { txHash, partnerTxHash, status } = action.payload
      //   const index = state.transactions.findIndex(tx => tx.txHash === txHash)
      //   const tx = state.transactions[index]
      //   if (partnerTxHash) {
      //     tx.partnerTxHash = partnerTxHash
      //     tx.timestampResolved = Date.now()
      //   }
      //   if (status) {
      //     tx.status = status
      //   }
      // },
      // setRoutes: (state, action: PayloadAction<Route[]>) => {
      //   state.routes = action.payload
      // },
      // setToAssetDecimals: (state, action: PayloadAction<number | undefined>) => {
      //   state.assetDecimals = action.payload ?? 18
      // },
    },
  })

const lifiSlices: { [k in LifiList]: ReturnType<typeof createLifiSlice> } = {
  lifi: createLifiSlice('lifi'),
}

type LifiReducers = { [k in keyof typeof lifiSlices]: ReturnType<typeof createLifiSlice>['reducer'] }

type LifiActions = { [k in keyof typeof lifiSlices]: ReturnType<typeof createLifiSlice>['actions'] }

type LifiSliceExtract = {
  lifiReducers: LifiReducers
  lifiActions: LifiActions
}

export const { lifiReducers, lifiActions } = (Object.keys(lifiSlices) as LifiList[]).reduce(
  (total, key) => {
    total.lifiReducers[key] = lifiSlices[key].reducer
    total.lifiActions[key] = lifiSlices[key].actions
    return total
  },
  { lifiActions: {}, lifiReducers: {} } as LifiSliceExtract
)
