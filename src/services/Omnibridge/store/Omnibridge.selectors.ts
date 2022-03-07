import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { BridgeList, SupportedBridges, TokenMap } from '../Omnibridge.types'
import { omnibridgeConfig } from '../Omnibridge.config'
import { socketSelectors } from '../Socket/Socket.selectors'

export const selectAllTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTxsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTxsSummary,
    socketSelectors['socket'].selectBridgeTxsSummary
  ],

  (txsSummaryTestnet, txsSummaryMainnet, txsSummarySocket) => [
    ...txsSummaryTestnet,
    ...txsSummaryMainnet,
    ...txsSummarySocket
  ]
)

export const selectAllLists = createSelector(
  [
    (state: AppState) => state.omnibridge['arbitrum:testnet'].lists,
    (state: AppState) => state.omnibridge['arbitrum:mainnet'].lists,
    (state: AppState) => state.omnibridge['socket'].lists
  ],
  (tokenListTestnet, tokenListMainnet, tokenListSocket) => {
    return { ...tokenListTestnet, ...tokenListMainnet, ...tokenListSocket }
  }
)

export const selectListsLoading = createSelector(
  [
    (state: AppState) => state.omnibridge['arbitrum:testnet'].listsStatus,
    (state: AppState) => state.omnibridge['arbitrum:mainnet'].listsStatus,
    (state: AppState) => state.omnibridge['socket'].listsStatus
  ],
  // Because of redux-persist initial state is undefined
  (...statuses) => statuses.some(status => ['loading', 'idle', undefined].includes(status))
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
  const { from, to } = ui
  if (!from.chainId || !to.chainId) return []

  const supportedBridges = Object.values(omnibridgeConfig).reduce<{ bridgeId: BridgeList; name: string }[]>(
    (total, bridgeInfo) => {
      const bridge = {
        name: bridgeInfo.displayName,
        bridgeId: bridgeInfo.bridgeId
      }

      bridgeInfo.supportedChains.forEach(({ from: supportedFrom, to: supportedTo }) => {
        if (
          (supportedFrom === from.chainId && supportedTo === to.chainId) ||
          (supportedFrom === to.chainId && supportedTo === from.chainId)
        ) {
          total.push(bridge)
        }
      })

      return total
    },
    []
  )

  return supportedBridges
})

export const selectSupportedBridgesForUI = createSelector(
  [
    selectSupportedBridges,
    arbitrumSelectors['arbitrum:testnet'].selectBridgingDetails,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgingDetails,
    socketSelectors['socket'].selectBridgingDetails
  ],
  (bridges, arbitrumTestnetDetails, arbitrumMainnetDetails, socketDetails) => {
    const bridgeNameMap = bridges.reduce<{ [bridgeId: string]: string }>((total, next) => {
      total[next.bridgeId] = next.name
      return total
    }, {})

    const supportedBridges = [arbitrumMainnetDetails, arbitrumTestnetDetails, socketDetails].reduce<SupportedBridges[]>(
      (total, bridge) => {
        if (bridgeNameMap[bridge.bridgeId] !== undefined) {
          total.push({
            name: bridgeNameMap[bridge.bridgeId],
            bridgeId: bridge.bridgeId,
            details: ['loading', 'failed'].includes(bridge.loading) ? {} : bridge.details,
            status: bridge.loading,
            errorMessage: bridge.errorMessage
          })
        }
        return total
      },
      []
    )

    return supportedBridges
  }
)
