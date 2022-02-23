import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { TokenMap } from '../Omnibridge.types'

export const selectAllTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTxsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTxsSummary
  ],

  (txsSummaryTestnet, txsSummaryMainnet) => [...txsSummaryTestnet, ...txsSummaryMainnet]
)

export const selectAllLists = createSelector(
  [
    (state: AppState) => state.omnibridge['arbitrum:testnet'].lists,
    (state: AppState) => state.omnibridge['arbitrum:mainnet'].lists
  ],
  (tokenListTestnet, tokenListMainnet) => {
    return { ...tokenListTestnet, ...tokenListMainnet }
  }
)

// NOTE: equivalent to useCombinedActiveList hook
export const selectAllActiveTokens = createSelector(
  [selectAllLists, (state: AppState) => state.omnibridge.common.activeLists],
  (allLists, activeLists) => {
    if (!activeLists.length) return {}

    const activeTokensMap = activeLists.reduce((allTokens, activeId) => {
      const tokenMapByChain = listToTokenMap(allLists[activeId])
      const supportedChainsByList = Object.keys(tokenMapByChain)

      supportedChainsByList.forEach(chain => {
        const castedChain = Number(chain)
        allTokens[castedChain] = { ...allTokens[castedChain], ...tokenMapByChain[castedChain] }
      })

      return allTokens
    }, {} as TokenMap)

    return activeTokensMap
  }
)

// NOTE: equivalend of useAllTokens()
export const selectAllTokensPerChain = createSelector(
  [selectAllActiveTokens, (state: AppState, chainId: ChainId) => chainId],
  (activeTokens, chainId) => {
    const mapWithoutLists = Object.keys(activeTokens[chainId] ?? {}).reduce<{ [address: string]: Token }>(
      (newMap, address) => {
        newMap[address] = activeTokens[chainId][address].token
        return newMap
      },
      {}
    )

    return mapWithoutLists
  }
)
