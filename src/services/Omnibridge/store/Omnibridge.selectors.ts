import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { BridgeList, TokenMap } from '../Omnibridge.types'
import { omnibridgeConfig } from '../Omnibridge.config'

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

export const selectSupportedBridges = createSelector([(state: AppState) => state.omnibridge.UI], ui => {
  const supportedBridges = Object.entries(omnibridgeConfig).reduce<
    { from: ChainId; to: ChainId; bridgeId: BridgeList; name: string }[]
  >((total, current) => {
    const bridgeInfo = current[1]

    const match = ui.from.chainId === bridgeInfo.supportedChains.from && ui.to.chainId === bridgeInfo.supportedChains.to
    const matchReverse =
      bridgeInfo.supportedChains.reverse &&
      ui.from.chainId === bridgeInfo.supportedChains.to &&
      ui.to.chainId === bridgeInfo.supportedChains.from

    if (match || matchReverse) {
      const bridge = {
        name: bridgeInfo.displayName,
        bridgeId: bridgeInfo.bridgeId,
        from: bridgeInfo.supportedChains.from,
        to: bridgeInfo.supportedChains.to
      }
      total.push(bridge)
    }
    return total
  }, [])

  return supportedBridges
})
