import { TransactionReceipt } from '@ethersproject/providers'
import { createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { OutgoingMessageState } from 'arb-ts'
import { ArbitrumBridgeTxnsState, ArbitrumBridgeTxn } from '../../../state/bridgeTransactions/types'
import { ArbitrumList, SyncState, BridgeDetails, BridgingDetailsErrorMessage } from '../EcoBridge.types'
import { arbitrumTransactionsAdapter } from './ArbitrumBridge.adapter'

interface ArbitrumBridgeState {
  transactions: EntityState<ArbitrumBridgeTxn>
  lists: { [id: string]: TokenList }
  listsStatus: SyncState
  bridgingDetails: BridgeDetails
  bridgingDetailsStatus: SyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
  lastMetadataCt: number
}

const now = () => new Date().getTime()

const initialState: ArbitrumBridgeState = {
  bridgingDetails: {},
  transactions: arbitrumTransactionsAdapter.getInitialState({}),
  lists: {},
  listsStatus: SyncState.IDLE,
  bridgingDetailsStatus: SyncState.IDLE,
  lastMetadataCt: 0,
}

export const createArbitrumSlice = (bridgeId: ArbitrumList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
      addTx: (state, action: PayloadAction<ArbitrumBridgeTxn>) => {
        const { payload: txn } = action

        if (!txn.txHash) return

        arbitrumTransactionsAdapter.upsertOne(state.transactions, txn)
      },
      updateTxReceipt: (
        state,
        action: PayloadAction<{
          chainId: ChainId
          txHash: string
          receipt: TransactionReceipt
          seqNum?: number
        }>
      ) => {
        const { receipt, txHash, seqNum } = action.payload

        arbitrumTransactionsAdapter.updateOne(state.transactions, {
          id: txHash,
          changes: {
            receipt,
            seqNum,
            timestampResolved: now(),
          },
        })
      },
      updateTxPartnerHash: (
        state,
        action: PayloadAction<{
          chainId: ChainId
          txHash: string
          partnerChainId: ChainId
          partnerTxHash: string
        }>
      ) => {
        const { txHash, partnerTxHash } = action.payload
        arbitrumTransactionsAdapter.updateOne(state.transactions, {
          id: txHash,
          changes: {
            partnerTxHash,
          },
        })
        arbitrumTransactionsAdapter.updateOne(state.transactions, {
          id: partnerTxHash,
          changes: {
            partnerTxHash: txHash,
          },
        })
      },
      updateTxWithdrawal: (
        state,
        action: PayloadAction<{
          chainId: ChainId
          txHash: string
          batchIndex?: string
          batchNumber?: string
          outgoingMessageState: OutgoingMessageState
        }>
      ) => {
        const { outgoingMessageState, txHash, batchIndex, batchNumber } = action.payload

        arbitrumTransactionsAdapter.updateOne(state.transactions, {
          id: txHash,
          changes: {
            outgoingMessageState,
            timestampResolved: outgoingMessageState === OutgoingMessageState.EXECUTED ? now() : undefined,
            batchIndex,
            batchNumber,
          },
        })
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
      },
      setTokenListsStatus: (state, action: PayloadAction<SyncState>) => {
        state.listsStatus = action.payload
      },
      migrateTxs: (state, action: PayloadAction<ArbitrumBridgeTxnsState>) => {
        const { payload } = action
        const [l1Txs, l2Txs] = Object.values(payload)
        const transactions = [...Object.values(l1Txs), ...Object.values(l2Txs)]

        arbitrumTransactionsAdapter.setAll(state.transactions, transactions)
      },
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

        state.bridgingDetails.gas = gas

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
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
    },
  })

const arbitrumSlices: { [k in ArbitrumList]: ReturnType<typeof createArbitrumSlice> } = {
  'arbitrum:mainnet': createArbitrumSlice('arbitrum:mainnet'),
  'arbitrum:testnet': createArbitrumSlice('arbitrum:testnet'),
}

type ArbitrumReducers = { [k in keyof typeof arbitrumSlices]: ReturnType<typeof createArbitrumSlice>['reducer'] }

type ArbitrumActions = { [k in keyof typeof arbitrumSlices]: ReturnType<typeof createArbitrumSlice>['actions'] }

type ArbitrumSliceExtract = {
  arbitrumReducers: ArbitrumReducers
  arbitrumActions: ArbitrumActions
}

export const { arbitrumReducers, arbitrumActions } = (Object.keys(arbitrumSlices) as ArbitrumList[]).reduce(
  (total, key) => {
    total.arbitrumReducers[key] = arbitrumSlices[key].reducer
    total.arbitrumActions[key] = arbitrumSlices[key].actions
    return total
  },
  { arbitrumActions: {}, arbitrumReducers: {} } as ArbitrumSliceExtract
)
