import { TransactionReceipt } from '@ethersproject/providers'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { OutgoingMessageState } from 'arb-ts'
import { BridgeTxnsState, BridgeTxn } from '../../../state/bridgeTransactions/types'
import { BridgeList } from '../Omnibridge.types'

interface ArbitrumBridgeState {
  transactions: BridgeTxnsState
  tokens: null
}

const now = () => new Date().getTime()

const initialState: ArbitrumBridgeState = {
  transactions: {},
  tokens: null
}

export const createArbitrumSlice = (bridgeId: BridgeList) =>
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
      }
    }
  })

const arbitrumSlices = {
  [BridgeList.ARB_MAINNET]: createArbitrumSlice(BridgeList.ARB_MAINNET),
  [BridgeList.ARB_TESTNET]: createArbitrumSlice(BridgeList.ARB_TESTNET)
}

type ArbitrumReducers = { [k in keyof typeof arbitrumSlices]: ReturnType<typeof createArbitrumSlice>['reducer'] }

type ArbitrumActions = { [k in keyof typeof arbitrumSlices]: ReturnType<typeof createArbitrumSlice>['actions'] }

type ArbitrumSliceExtract = {
  arbitrumReducers: ArbitrumReducers
  arbitrumActions: ArbitrumActions
}

export const { arbitrumReducers, arbitrumActions } = (Object.keys(arbitrumSlices) as BridgeList[]).reduce(
  (total, key) => {
    total.arbitrumReducers[key] = arbitrumSlices[key].reducer
    total.arbitrumActions[key] = arbitrumSlices[key].actions
    return total
  },
  { arbitrumActions: {}, arbitrumReducers: {} } as ArbitrumSliceExtract
)
