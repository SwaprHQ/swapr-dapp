import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { BridgeDetails, BridgingDetailsErrorMessage, SyncState, XdaiBridgeList } from '../EcoBridge.types'
import { xdaiBridgeTransactionAdapter } from './XdaiBridge.adapter'
import { XdaiBridgeTransaction, XdaiMessage } from './XdaiBridge.types'

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

          state.bridgingDetails.gas = gas
          state.bridgingDetails.fee = fee
          state.bridgingDetails.estimateTime = estimateTime
          state.bridgingDetails.receiveAmount = receiveAmount
        }
      },
      setBridgeDetailsStatus: (
        state,
        action: PayloadAction<{ status: SyncState; errorMessage?: BridgingDetailsErrorMessage }>
      ) => {
        state.bridgingDetailsStatus = action.payload.status
      },
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
      setTokenListsStatus: (state, action: PayloadAction<SyncState>) => {
        state.listsStatus = action.payload
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        state.lists = action.payload
      },
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
