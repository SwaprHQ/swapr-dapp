import { ChainId, Token } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { DEFAULT_TOKEN_LIST } from '../../../constants'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { connextSelectors } from '../Connext/Connext.selectors'
import { ecoBridgeConfig } from '../EcoBridge.config'
import {
  ArbitrumList,
  BridgeList,
  BridgeTxsFilter,
  ConnextList,
  OmniBridgeList,
  SocketList,
  SupportedBridges,
  SyncState,
  TokenMap,
  XdaiBridgeList,
  LifiList,
} from '../EcoBridge.types'
import { omniBridgeSelectors } from '../OmniBridge/OmniBridge.selectors'
import { socketSelectors } from '../Socket/Socket.selectors'
import { xdaiSelectors } from '../Xdai/XdaiBridge.selectors'
import { lifiSelectors } from './../Lifi/Lifi.selectors'

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

const createSelectBridgingDetails = (
  bridgeId: ConnextList | OmniBridgeList | XdaiBridgeList | ArbitrumList | SocketList | LifiList
) =>
  createSelector(
    [
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetails,
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsStatus,
      (state: AppState) => state.ecoBridge[bridgeId].bridgingDetailsErrorMessage,
    ],
    (details, loading, errorMessage) => {
      return {
        bridgeId,
        details,
        loading,
        errorMessage,
      }
    }
  )

export const selectSupportedBridges = createSelector(
  [
    (state: AppState) => state.ecoBridge.ui.from.chainId,
    (state: AppState) => state.ecoBridge.ui.to.chainId,
    (state: AppState) => state.ecoBridge.ui.isBridgeSwapActive,
  ],
  (fromChainId, toChainId, isBridgeSwapActive) => {
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

    return isBridgeSwapActive
      ? supportedBridges.filter(bridge => ['socket', 'lifi'].includes(bridge.bridgeId))
      : supportedBridges
  }
)

// TXS
export const selectBridgeTransactions = createSelector(
  [
    arbitrumSelectors['arbitrum:testnet'].selectBridgeTransactionsSummary,
    arbitrumSelectors['arbitrum:mainnet'].selectBridgeTransactionsSummary,
    socketSelectors['socket'].selectBridgeTransactionsSummary,
    omniBridgeSelectors['omnibridge:eth-xdai'].selectBridgeTransactionsSummary,
    connextSelectors['connext'].selectBridgeTransactionsSummary,
    xdaiSelectors['xdai'].selectBridgeTransactionsSummary,
    lifiSelectors['lifi'].selectBridgeTransactionsSummary,
  ],
  (
    txsSummaryTestnet,
    txsSummaryMainnet,
    txsSummarySocket,
    txsOmnibridgeEthGnosis,
    txsSummaryConnext,
    txsSummaryXdai,
    txsSummaryLifi
  ) => {
    const txs = [
      ...txsSummaryTestnet,
      ...txsSummaryMainnet,
      ...txsSummarySocket,
      ...txsOmnibridgeEthGnosis,
      ...txsSummaryConnext,
      ...txsSummaryXdai,
      ...txsSummaryLifi,
    ]

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
    (state: AppState) => state.ecoBridge['xdai'].listsStatus,
    (state: AppState) => state.ecoBridge['connext'].listsStatus,
    (state: AppState) => state.ecoBridge['omnibridge:eth-xdai'].listsStatus,
  ],
  // Because of redux-persist initial state is undefined
  (...statuses) => statuses.some(status => ['loading', 'idle', undefined].includes(status))
)

export const selectBridgeLists = createSelector(
  [
    (state: AppState) => state.ecoBridge['arbitrum:testnet'].lists,
    (state: AppState) => state.ecoBridge['arbitrum:mainnet'].lists,
    (state: AppState) => state.ecoBridge['socket'].lists,
    (state: AppState) => state.ecoBridge['connext'].lists,
    (state: AppState) => state.ecoBridge['omnibridge:eth-xdai'].lists,
    (state: AppState) => state.ecoBridge['xdai'].lists,
    (state: AppState) => state.ecoBridge['lifi'].lists,
    (state: AppState) => state.lists.byUrl[DEFAULT_TOKEN_LIST].current,
  ],
  (
    tokenListTestnet,
    tokenListMainnet,
    tokenListSocket,
    tokenListConnext,
    omnibridgeEthGnosisList,
    tokenListXdai,
    tokenListLifi,
    swprDefaultList
  ) => {
    // Tmp solution to add swpr token list to arbitrum bridges
    const swprListWithIds = {
      'arbitrum:testnet-swpr': swprDefaultList as TokenList,
      'arbitrum:mainnet-swpr': swprDefaultList as TokenList,
    }
    const allTokenLists = {
      ...swprListWithIds,
      ...tokenListTestnet,
      ...tokenListMainnet,
      ...tokenListSocket,
      ...tokenListXdai,
      ...tokenListConnext,
      ...tokenListLifi,
      ...omnibridgeEthGnosisList,
    }

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
  [
    selectSupportedLists,
    (state: AppState) => state.ecoBridge.common.activeLists,
    (state: AppState) => state.ecoBridge.ui.isBridgeSwapActive,
  ],
  (supportedLists, activeLists, isBridgeSwapActive) => {
    const lists = isBridgeSwapActive ? ['socket'] : activeLists

    if (!lists.length) return {}

    const activeTokensMap = lists.reduce((activeTokens, activeId) => {
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
const getTokensPerChain = (activeTokens: TokenMap, chainId: ChainId) => {
  const mapWithoutLists = Object.keys(activeTokens[chainId] ?? {}).reduce<{
    [address: string]: Token
  }>((newMap, address) => {
    newMap[address] = activeTokens[chainId][address].token
    return newMap
  }, {})

  return mapWithoutLists
}

export const selectBridgeSupportedTokensOnChain = createSelector(
  [
    selectBridgeActiveTokens,
    (state: AppState, chainId: ChainId) => chainId,
    (state: AppState) => state.ecoBridge.ui.to.chainId,
  ],
  (activeTokens, chainId, toChainId) => {
    const tokensOnFromChainId = getTokensPerChain(activeTokens, chainId)
    const tokensOnToChainId = getTokensPerChain(activeTokens, toChainId)

    return {
      tokensOnFromChainId,
      tokensOnToChainId,
    }
  }
)

const connextBridgeDetails = createSelectBridgingDetails('connext')
const socketBridgeDetails = createSelectBridgingDetails('socket')
const arbitrumMainnetBridgeDetails = createSelectBridgingDetails('arbitrum:mainnet')
const arbitrumTestnetBridgeDetails = createSelectBridgingDetails('arbitrum:testnet')
const omnibridgeBridgeDetails = createSelectBridgingDetails('omnibridge:eth-xdai')
const xdaiBridgeDetails = createSelectBridgingDetails('xdai')
const lifiBridgeDetails = createSelectBridgingDetails('lifi')

export const selectSupportedBridgesForUI = createSelector(
  [
    selectSupportedBridges,
    arbitrumTestnetBridgeDetails,
    arbitrumMainnetBridgeDetails,
    omnibridgeBridgeDetails,
    socketBridgeDetails,
    connextBridgeDetails,
    xdaiBridgeDetails,
    lifiBridgeDetails,
  ],
  (
    bridges,
    arbitrumTestnetDetails,
    arbitrumMainnetDetails,
    omnibridgeEthGnosisDetails,
    socketDetails,
    connextDetails,
    xdaiDetails,
    lifiDetails
  ) => {
    const bridgeNameMap = bridges.reduce<{ [bridgeId: string]: string }>((total, next) => {
      total[next.bridgeId] = next.name
      return total
    }, {})

    const supportedBridges = [
      arbitrumMainnetDetails,
      arbitrumTestnetDetails,
      omnibridgeEthGnosisDetails,
      socketDetails,
      connextDetails,
      xdaiDetails,
      lifiDetails,
    ].reduce<SupportedBridges[]>((total, bridge) => {
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
    }, [])

    return supportedBridges.filter(bridge => bridge.status && bridge.status !== SyncState.FAILED)
  }
)
