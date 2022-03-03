import { TransactionReceipt } from '@ethersproject/providers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { OutgoingMessageState } from 'arb-ts'
import { BridgeTxnsState, BridgeTxn } from '../../../state/bridgeTransactions/types'
import { ArbitrumList, AsyncState, BridgeDetails, BridgingDetailsErrorMessage } from '../Omnibridge.types'

interface ArbitrumBridgeState {
  transactions: BridgeTxnsState
  lists: { [id: string]: TokenList }
  listsStatus: AsyncState
  bridgingDetails: BridgeDetails
  bridgingDetailsStatus: AsyncState
  bridgingDetailsErrorMessage?: BridgingDetailsErrorMessage
}

const now = () => new Date().getTime()

const initialState: ArbitrumBridgeState = {
  bridgingDetails: {},
  transactions: {},
  lists: {},
  listsStatus: 'idle',
  bridgingDetailsStatus: 'idle'
}

export const createArbitrumSlice = (bridgeId: ArbitrumList) =>
  createSlice({
    name: bridgeId,
    initialState,
    reducers: {
      addTx: (state, action: PayloadAction<Omit<BridgeTxn, 'timestampCreated' | 'timestampResolved'>>) => {
        const { payload: txn } = action

        if (!txn.txHash) return

        const { txHash, chainId } = txn

        if (state.transactions[chainId]?.[txHash]) {
          throw Error('Attempted to add existing bridge transaction.')
        }
        const transactions = state.transactions[chainId] ?? {}

        transactions[txHash] = {
          ...txn,
          timestampCreated: now()
        }

        state.transactions[chainId] = transactions
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
        const { chainId, receipt, txHash, seqNum } = action.payload

        if (!state.transactions[chainId]?.[txHash]) {
          throw Error('Transaction not found ' + txHash)
        }
        const txn = state.transactions[chainId][txHash]
        if (txn.receipt) return
        txn.receipt = receipt

        if (seqNum) {
          txn.seqNum = seqNum
        }

        txn.timestampResolved = now()
        state.transactions[chainId][txHash] = txn
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
        const { chainId, txHash, partnerChainId, partnerTxHash } = action.payload

        const tx = state.transactions[chainId][txHash]
        tx.partnerTxHash = partnerTxHash

        const partnerTx = state.transactions[partnerChainId][partnerTxHash]
        partnerTx.partnerTxHash = txHash

        state.transactions[chainId][txHash] = tx
        state.transactions[partnerChainId][partnerTxHash] = partnerTx
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
        const { chainId, outgoingMessageState, txHash, batchIndex, batchNumber } = action.payload

        const tx = state.transactions[chainId][txHash]
        tx.outgoingMessageState = outgoingMessageState
        if (outgoingMessageState === OutgoingMessageState.EXECUTED) {
          tx.timestampResolved = now()
        }
        if (batchIndex && batchNumber) {
          tx.batchNumber = batchNumber
          tx.batchIndex = batchIndex
        }
        state.transactions[chainId][txHash] = tx
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
      },
      setTokenListsStatus: (state, action: PayloadAction<AsyncState>) => {
        state.listsStatus = action.payload
      },
      migrateTxs: (state, action: PayloadAction<BridgeTxnsState>) => {
        const { payload } = action
        const networks = Object.keys(payload)

        networks.forEach(chainIdStr => {
          const chainId = Number(chainIdStr)

          if (!(chainId in state.transactions)) {
            state.transactions[chainId] = payload[chainId]
            return
          }

          Object.keys(payload[chainId]).forEach(txHash => {
            if (!state.transactions[chainId][txHash]) {
              state.transactions[chainId][txHash] = payload[chainId][txHash]
            }
          })
        })
      },
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
      setBridgeDetailsStatus: (
        state,
        action: PayloadAction<{ status: AsyncState; errorMessage?: BridgingDetailsErrorMessage }>
      ) => {
        const { status, errorMessage } = action.payload
        state.bridgingDetailsStatus = status
        if (errorMessage) {
          state.bridgingDetailsErrorMessage = errorMessage
        }
      }
    }
  })

const arbitrumSlices: { [k in ArbitrumList]: ReturnType<typeof createArbitrumSlice> } = {
  'arbitrum:mainnet': createArbitrumSlice('arbitrum:mainnet'),
  'arbitrum:testnet': createArbitrumSlice('arbitrum:testnet')
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
