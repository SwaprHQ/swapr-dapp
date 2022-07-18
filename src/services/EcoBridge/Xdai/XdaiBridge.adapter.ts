import { createEntityAdapter } from '@reduxjs/toolkit'

import { XdaiBridgeTransaction } from './XdaiBridge.types'

export const xdaiBridgeTransactionAdapter = createEntityAdapter<XdaiBridgeTransaction>({
  selectId: transaction => transaction.txHash,
})
