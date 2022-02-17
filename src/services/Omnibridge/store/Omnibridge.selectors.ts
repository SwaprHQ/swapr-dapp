import { createSelector } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { AppState } from '../../../state'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'

export const selectAllTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTxsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTxsSummary
  ],

  (txsSummaryTestnet, txsSummaryMainnet) => [...txsSummaryTestnet, ...txsSummaryMainnet]
)

export const selectAllTokensPerChain = createSelector(
  [
    arbitrumSelectors['arbitrum:mainnet'].selectTokenList,
    arbitrumSelectors['arbitrum:testnet'].selectTokenList,
    (state: AppState, chainId: ChainId) => chainId
  ],
  (tokenListTestnet, tokenListMainnet, chainId) => ({ ...tokenListTestnet[chainId], ...tokenListMainnet[chainId] })
)
