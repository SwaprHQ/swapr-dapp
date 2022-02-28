import { createSelector } from '@reduxjs/toolkit'
import { ChainId, Token } from '@swapr/sdk'
import { AppState } from '../../../state'
import { listToTokenMap } from '../../../state/lists/hooks'
import { arbitrumSelectors } from '../Arbitrum/ArbitrumBridge.selectors'
import { AsyncState, BridgeList, BridgingDetailsErrorMessage, TokenMap } from '../Omnibridge.types'
import { omnibridgeConfig } from '../Omnibridge.config'
import { socketSelectors } from '../Socket/Socket.selectors'
import { Route } from '../Socket/Socket.types'

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

export const selectListsLoading = createSelector(
  [
    (state: AppState) => state.omnibridge['arbitrum:testnet'].listsStatus,
    (state: AppState) => state.omnibridge['arbitrum:mainnet'].listsStatus
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
  const supportedBridges = Object.entries(omnibridgeConfig).reduce<{ bridgeId: BridgeList; name: string }[]>(
    (total, current) => {
      const [, bridgeInfo] = current
      const match =
        ui.from.chainId === bridgeInfo.supportedChains.from && ui.to.chainId === bridgeInfo.supportedChains.to
      const matchReverse =
        bridgeInfo.supportedChains.reverse &&
        ui.from.chainId === bridgeInfo.supportedChains.to &&
        ui.to.chainId === bridgeInfo.supportedChains.from

      if (match || matchReverse) {
        const bridge = {
          name: bridgeInfo.displayName,
          bridgeId: bridgeInfo.bridgeId
        }
        total.push(bridge)
      }
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
    socketSelectors.socket.selectBridgingDetails
  ],
  (bridges, arbitrumTestnetDetails, arbitrumMainnetDetails, socketDetails) => {
    type RetValType = {
      name: string
      bridgeId: BridgeList
      status: AsyncState
      details: {
        routes?: {
          tokenDetails: {
            chainId: number
            address: string
            decimals: number
            icon: string
            name: string
            symbol: string
          }
          routes: Route[]
        }
        gas?: string
        estimateTime?: string
        fee?: string
      }
      errorMessage?: BridgingDetailsErrorMessage
      receiveAmount?: string
    }

    const bridgeNameMap = bridges.reduce<{ [bridgeId: string]: string }>((total, next) => {
      total[next.bridgeId] = next.name
      return total
    }, {})

    const retVal: RetValType[] = [arbitrumMainnetDetails, arbitrumTestnetDetails, socketDetails]
      .map(bridge => {
        return {
          name: bridgeNameMap[bridge.bridgeId],
          bridgeId: bridge.bridgeId,
          details: ['loading', 'failed'].includes(bridge.loading) ? {} : bridge.details,
          status: bridge.loading,
          errorMessage: bridge.errorMessage,
          receiveAmount: bridge.receiveAmount
        }
      })
      .filter(bridge => bridge.name !== undefined)

    return retVal
  }
)
