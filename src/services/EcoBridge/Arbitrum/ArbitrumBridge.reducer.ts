import { TransactionReceipt } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { PayloadAction } from '@reduxjs/toolkit'
import { OutgoingMessageState } from 'arb-ts'

import { ArbitrumBridgeTxn, ArbitrumBridgeTxnsState } from '../../../state/bridgeTransactions/types'
import { ArbitrumList } from '../EcoBridge.types'
import { createEcoBridgeChildBaseSlice } from '../EcoBridge.utils'
import { arbitrumTransactionsAdapter } from './ArbitrumBridge.adapter'
import { ArbitrumInitialState } from './ArbitrumBridge.types'

const now = () => new Date().getTime()

const initialState: ArbitrumInitialState = {
  transactions: arbitrumTransactionsAdapter.getInitialState({}),
}

export const createArbitrumSlice = (bridgeId: ArbitrumList) =>
  createEcoBridgeChildBaseSlice({
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
      migrateTxs: (state, action: PayloadAction<ArbitrumBridgeTxnsState>) => {
        const { payload } = action
        const [l1Txs, l2Txs] = Object.values(payload)
        const transactions = [...Object.values(l1Txs), ...Object.values(l2Txs)]

        arbitrumTransactionsAdapter.setAll(state.transactions, transactions)
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
