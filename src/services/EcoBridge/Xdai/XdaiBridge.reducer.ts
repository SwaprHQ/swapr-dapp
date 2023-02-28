import { EntityState, PayloadAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { xdaiBridgeTransactionAdapter } from './XdaiBridge.adapter'
import { XdaiBridgeTransaction, XdaiMessage } from './XdaiBridge.types'
import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { BridgeDetails, SyncState, XdaiBridgeList } from '../EcoBridge.types'
import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'

interface XdaiBridgeState {
  bridgingDetails: BridgeDetails
  bridgingDetailsStatus: SyncState
  lastMetadataCt: number
  listsStatus: SyncState
  lists: { [id: string]: TokenList }
  transactions: EntityState<XdaiBridgeTransaction>
}

const initialState: XdaiBridgeState = {
  transactions: xdaiBridgeTransactionAdapter.getInitialState({}),
  bridgingDetails: {},
  bridgingDetailsStatus: SyncState.IDLE,
  lists: {},
  listsStatus: SyncState.IDLE,
  lastMetadataCt: 0,
}

const createXdaiSlice = (bridgeId: XdaiBridgeList) =>
  createEcoBridgeChildBaseSlice({
    name: bridgeId,
    initialState,
    reducers: {
      addTransactions: (state, action: PayloadAction<XdaiBridgeTransaction[]>) => {
        xdaiBridgeTransactionAdapter.addMany(state.transactions, action.payload)
      },
      addTransaction: (state, action: PayloadAction<XdaiBridgeTransaction>) => {
        xdaiBridgeTransactionAdapter.upsertOne(state.transactions, action.payload)
      },
      updateTransactionMessage: (state, action: PayloadAction<XdaiMessage & { txHash: string }>) => {
        xdaiBridgeTransactionAdapter.updateOne(state.transactions, {
          id: action.payload.txHash,
          changes: {
            message: action.payload.message,
          },
        })
      },
      updateTransactionStatus: (state, action: PayloadAction<{ txHash: string; status: BridgeTransactionStatus }>) => {
        const { status } = action.payload

        xdaiBridgeTransactionAdapter.updateOne(state.transactions, {
          id: action.payload.txHash,
          changes: {
            status,
            timestampResolved:
              status === BridgeTransactionStatus.CLAIMED || status === BridgeTransactionStatus.CONFIRMED
                ? Date.now()
                : undefined,
          },
        })
      },
      updatePartnerTxHash: (state, action: PayloadAction<{ txHash: string; partnerTxHash: string }>) => {
        xdaiBridgeTransactionAdapter.updateOne(state.transactions, {
          id: action.payload.txHash,
          changes: {
            partnerTransactionHash: action.payload.partnerTxHash,
          },
        })
      },
      updateTransactionAfterCollect: (state, action: PayloadAction<{ txHash: string }>) => {
        xdaiBridgeTransactionAdapter.updateOne(state.transactions, {
          id: action.payload.txHash,
          changes: {
            isFulfilling: true,
            status: BridgeTransactionStatus.PENDING,
          },
        })
      },
    },
  })

const xdaiSlices: { [k in XdaiBridgeList]: ReturnType<typeof createXdaiSlice> } = {
  xdai: createXdaiSlice('xdai'),
}

type XdaiReducers = { [k in keyof typeof xdaiSlices]: ReturnType<typeof createXdaiSlice>['reducer'] }

type XdaiActions = { [k in keyof typeof xdaiSlices]: ReturnType<typeof createXdaiSlice>['actions'] }

type XdaiSliceExtract = {
  xdaiReducers: XdaiReducers
  xdaiActions: XdaiActions
}

export const { xdaiReducers, xdaiActions } = (Object.keys(xdaiSlices) as XdaiBridgeList[]).reduce(
  (total, key) => {
    total.xdaiReducers[key] = xdaiSlices[key].reducer
    total.xdaiActions[key] = xdaiSlices[key].actions
    return total
  },
  { xdaiActions: {}, xdaiReducers: {} } as XdaiSliceExtract
)
