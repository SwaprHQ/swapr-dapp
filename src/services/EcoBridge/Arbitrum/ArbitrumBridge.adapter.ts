import { createEntityAdapter } from '@reduxjs/toolkit'
import { BridgeTxn } from '../../../state/bridgeTransactions/types'

export const arbitrumTransactionsAdapter = createEntityAdapter<BridgeTxn>({
  selectId: transaction => transaction.txHash
})
