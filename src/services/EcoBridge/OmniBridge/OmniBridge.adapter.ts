import { createEntityAdapter } from '@reduxjs/toolkit'

import { OmniBridgeTransaction } from './OmniBridge.types'

export const omniTransactionsAdapter = createEntityAdapter<OmniBridgeTransaction>({
  selectId: transaction => transaction.txHash,
})
