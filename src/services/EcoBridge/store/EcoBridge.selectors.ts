import { TokenList } from '@uniswap/token-lists'
import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'

import { AppState } from '../../../state'
import { ecoBridgeConfig } from '../EcoBridge.config'
import { listToTokenMap } from '../../../state/lists/hooks'
import { socketSelectors } from '../Socket/Socket.selectors'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { BridgeList, BridgeTxsFilter, SupportedBridges, SyncState, TokenMap } from '../EcoBridge.types'
import { DEFAULT_TOKEN_LIST } from '../../../constants'

/**
 * Each bridge declares in config which chainId pairs it supports.
 * SupportedChains are used to filter out bridges that doesn't support pair selected in the ui.
 *
 * @example
 *    // Bridge A supports: 1 - 100, 100-200
 *    // Bridge B supports: 1 - 100
 *    // Bridge C supports: 100-200
 *
 *    // fromChainId: 100
 *    // toChainIdId: 200
 *
 *    // SupportedBridges gonna be Bridge A, Bridge C
 *
 */

export const selectSupportedBridges = createSelector(
  [(state: AppState) => state.ecoBridge.ui.from.chainId, (state: AppState) => state.ecoBridge.ui.to.chainId],
  (fromChainId, toChainId) => {
    if (!fromChainId || !toChainId) return []

    const supportedBridges = Object.values(ecoBridgeConfig).reduce<{ bridgeId: BridgeList; name: string }[]>(
      (total, bridgeInfo) => {
        const bridge = {
          name: bridgeInfo.displayName,
          bridgeId: bridgeInfo.bridgeId,
        }

        bridgeInfo.supportedChains.forEach(({ from: supportedFrom, to: supportedTo }) => {
          if (
            (supportedFrom === fromChainId && supportedTo === toChainId) ||
            (supportedFrom === toChainId && supportedTo === fromChainId)
          ) {
            total.push(bridge)
          }
        })

        return total
      },
      []
    )

    return supportedBridges
  }
)

// TXS

export const selectBridgeTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTransactionsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTransactionsSummary,
    socketSelectors['socket'].selectBridgeTransactionsSummary,
  ],
  (txsSummaryTestnet, txsSummaryMainnet, txsSummarySocket) => {
    const txs = [...txsSummaryTestnet, ...txsSummaryMainnet, ...txsSummarySocket]

    return txs
  }
)

export const selectBridgeFilteredTransactions = createSelector(
  [selectBridgeTransactions, (state: AppState) => state.ecoBridge.ui.filter],
  (txs, txsFilter) => {
    const sortedTxs = txs.sort((firstTx, secondTx) => {
      if (firstTx.status === 'pending' && secondTx.status !== 'pending') return -1
      if (firstTx.status === 'pending' && secondTx.status === 'pending') {
        if (!firstTx.timestampResolved || !secondTx.timestampResolved) return 0
        if (firstTx.timestampResolved > secondTx.timestampResolved) return -1
      }
      if (firstTx.status === 'redeem' && secondTx.status !== 'pending') return -1
      return 0
    })

    switch (txsFilter) {
      case BridgeTxsFilter.COLLECTABLE:
        return sortedTxs.filter(summary => summary.status === 'redeem')
      case BridgeTxsFilter.RECENT:
        const passed24h = new Date().getTime() - 1000 * 60 * 60 * 24
        return sortedTxs.filter(summary => {
          if (!summary.timestampResolved) return true
          return summary.timestampResolved >= passed24h
        })
      default:
        return txs
    }
  }
)

export const selectBridgeCollectableTx = createSelector(
  [selectBridgeTransactions, (state: AppState) => state.ecoBridge.ui.collectableTxHash],
  (txs, txHash) => {
    if (!txHash) {
      return txs.find(tx => tx.status === 'redeem')
    }
    return txs.find(tx => tx.txHash === txHash)
  }
)

// LISTS

export const selectBridgeListsLoadingStatus = createSelector(
  [
    (state: AppState) => state.ecoBridge['arbitrum:testnet'].listsStatus,
    (state: AppState) => state.ecoBridge['arbitrum:mainnet'].listsStatus,
    (state: AppState) => state.ecoBridge['socket'].listsStatus,
  ],
  // Because of redux-persist initial state is undefined
  (...statuses) => statuses.some(status => ['loading', 'idle', undefined].includes(status))
)

export const selectBridgeLists = createSelector(
  [
    (state: AppState) => state.ecoBridge['arbitrum:testnet'].lists,
    (state: AppState) => state.ecoBridge['arbitrum:mainnet'].lists,
    (state: AppState) => state.ecoBridge['socket'].lists,
    (state: AppState) => state.lists.byUrl[DEFAULT_TOKEN_LIST].current,
  ],
  (tokenListTestnet, tokenListMainnet, tokenListSocket, swprDefaultList) => {
    // Tmp solution to add swpr token list to arbitrum bridges
    const swprListWithIds = {
      'arbitrum:testnet-swpr': swprDefaultList as TokenList,
      'arbitrum:mainnet-swpr': swprDefaultList as TokenList,
    }
    const allTokenLists = { ...swprListWithIds, ...tokenListTestnet, ...tokenListMainnet, ...tokenListSocket }

    return allTokenLists
  }
)

/**
 * Returns lists that support currently selected fromChainId & toChainId
 */

export const selectSupportedLists = createSelector(
  [selectBridgeLists, selectSupportedBridges],
  (tokenLists, supportedBridges) => {
    const supportedIds = supportedBridges.map(bridge => bridge.bridgeId)
    const supportedTokenLists = Object.entries(tokenLists).reduce<{ [id: string]: TokenList }>(
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

// TOKENS

/**
 * Returns {[address: string]: Token} for provided chainId
 */

export const selectBridgeTokens = createSelector([selectBridgeLists], allLists => {
  const allTokens = Object.values(allLists).reduce<{ [chainId: number]: { [address: string]: Token } }>(
    (allTokens, list) => {
      const tokenMapsByChain = listToTokenMap(list)

      Object.entries(tokenMapsByChain).forEach(([chainId, tokenMapWithUrls]) => {
        const tokensOnChain = Object.entries(tokenMapWithUrls).reduce<{ [address: string]: Token }>(
          (mapWithoutUrl, [tokenAddress, tokenObj]) => {
            mapWithoutUrl[tokenAddress] = tokenObj.token
            return mapWithoutUrl
          },
          {}
        )

        allTokens[Number(chainId)] = { ...allTokens[Number(chainId)], ...tokensOnChain }
      })

      return allTokens
    },
    {}
  )
  return allTokens
})

export const selectBridgeActiveTokens = createSelector(
  [selectSupportedLists, (state: AppState) => state.ecoBridge.common.activeLists],
  (supportedLists, activeLists) => {
    if (!activeLists.length) return {}

    const activeTokensMap = activeLists.reduce((activeTokens, activeId) => {
      const tokenMapByChain = listToTokenMap(supportedLists[activeId])
      const supportedChainsByList = Object.keys(tokenMapByChain)

      supportedChainsByList.forEach(chain => {
        const castedChain = Number(chain)
        activeTokens[castedChain] = { ...activeTokens[castedChain], ...tokenMapByChain[castedChain] }
      })

      return activeTokens
    }, {} as TokenMap)

    return activeTokensMap
  }
)

export const selectBridgeSupportedTokensOnChain = createSelector(
  [selectBridgeActiveTokens, (state: AppState, chainId: ChainId) => chainId],
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

export const selectSupportedBridgesForUI = createSelector(
  [
    selectSupportedBridges,
    arbitrumSelectors['arbitrum:testnet'].selectBridgingDetails,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgingDetails,
    socketSelectors['socket'].selectBridgingDetails,
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
            errorMessage: bridge.errorMessage,
          })
        }
        return total
      },
      []
    )

    return supportedBridges.filter(bridge => bridge.status !== SyncState.FAILED)
  }
)
