import { createEntityAdapter } from '@reduxjs/toolkit'

import { ConnextTransaction } from './Connext.types'

export const connextTransactionsAdapter = createEntityAdapter<ConnextTransaction>({
  selectId: transaction => transaction.prepareTransactionHash,
})
