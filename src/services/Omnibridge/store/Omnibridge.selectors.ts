import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { BridgeList, BridgeTxsFilter, SupportedBridges, TokenMap } from '../Omnibridge.types'
import { omnibridgeConfig } from '../Omnibridge.config'
import { socketSelectors } from '../Socket/Socket.selectors'

export const selectAllTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTxsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTxsSummary,
    socketSelectors['socket'].selectBridgeTxsSummary,
    (state: AppState) => state.omnibridge.UI.filter
  ],

  (txsSummaryTestnet, txsSummaryMainnet, txsSummarySocket, txsFilter) => {
    const txs = [...txsSummaryTestnet, ...txsSummaryMainnet, ...txsSummarySocket]

    switch (txsFilter) {
      case BridgeTxsFilter.COLLECTABLE:
        return txs.filter(summary => summary.status === 'redeem')
      case BridgeTxsFilter.RECENT:
        const passed24h = new Date().getTime() - 1000 * 60 * 60 * 24
        return txs.filter(summary => {
          if (!summary.timestampResolved) return true
          return summary.timestampResolved >= passed24h
        })
      default:
        return txs
    }
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

export const selectAllLists = createSelector(
  [
    (state: AppState) => state.omnibridge['arbitrum:testnet'].lists,
    (state: AppState) => state.omnibridge['arbitrum:mainnet'].lists,
    (state: AppState) => state.omnibridge['socket'].lists,
    selectSupportedBridges
  ],
  (tokenListTestnet, tokenListMainnet, tokenListSocket, supportedBridges) => {
    const supportedIds = supportedBridges.map(bridge => bridge.bridgeId)
    const allTokenLists = { ...tokenListTestnet, ...tokenListMainnet, ...tokenListSocket }

    const supportedTokenLists = Object.entries(allTokenLists).reduce<typeof tokenListMainnet>(
      (total, [listId, list]) => {
        supportedIds.forEach(id => {
          const pattern = new RegExp(`^${id}[-]?`, 'g')
          if (pattern.test(listId)) {
            total[listId] = list
          }
        })
        return total
      },
      {}
    )

    return supportedTokenLists
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
