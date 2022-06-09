import { createEntityAdapter } from '@reduxjs/toolkit'
import { ArbitrumBridgeTxn } from '../../../state/bridgeTransactions/types'

export const arbitrumTransactionsAdapter = createEntityAdapter<ArbitrumBridgeTxn>({
  selectId: transaction => transaction.txHash,
})
