import { createEntityAdapter } from '@reduxjs/toolkit'
import { OmniBridgeTxn } from './OmniBridge.types'

export const omniTransactionsAdapter = createEntityAdapter<OmniBridgeTxn>({
  selectId: transaction => transaction.txHash,
})
