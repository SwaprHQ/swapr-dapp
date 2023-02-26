import { ChainId } from '@swapr/sdk'

import { Step } from '@lifi/sdk'
import { PayloadAction } from '@reduxjs/toolkit'

import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'
import { LifiList } from './../EcoBridge.types'
import { LifiStatusResponse, LifiTransactionStatus } from './Lifi.types'

type LifiBridgeState = {
  transactions: LifiTransactionStatus[]
  route: Step
  approvalData: {
    chainId?: ChainId
    owner?: string
    allowanceTarget?: string
    tokenAddress?: string
    amount?: string
  }
  txBridgingData: {
    data?: string
    to?: string
  }
}

const initialState: LifiBridgeState = {
  transactions: [],
  approvalData: {},
  route: {} as Step,
  txBridgingData: {},
}

const createLifiSlice = (bridgeId: LifiList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
      // TODO: cleanup redux and fix txn history
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
      addTx: (state, action: PayloadAction<LifiTransactionStatus>) => {
        const { payload: txn } = action
        state.transactions.push(txn)
      },

      updateTx: (state, action: PayloadAction<LifiStatusResponse>) => {
        const { timeResolved, ...statusResponse } = action.payload

        state.transactions.forEach((txn, index) => {
          if (txn.statusResponse.sending.txHash === statusResponse.sending.txHash) {
            state.transactions[index] = { ...txn, statusResponse: statusResponse, timeResolved }
          }
        })
      },
      setRoute: (state, action: PayloadAction<Step>) => {
        state.route = action.payload
      },
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
