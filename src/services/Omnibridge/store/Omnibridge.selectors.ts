import { createSelector } from '@reduxjs/toolkit'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'

export const selectAllTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTxsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTxsSummary
  ],

  (txsSummaryTestnet, txsSummaryMainnet) => [...txsSummaryTestnet, ...txsSummaryMainnet]
)
