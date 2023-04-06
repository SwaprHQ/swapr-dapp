import { ChainId, Currency } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'
import { type TokenInfo, type TokenList } from '@uniswap/token-lists/dist/types'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'

import { WrappedTokenInfo } from './wrapped-token-info'
import { NETWORK_DETAIL, ZERO_ADDRESS } from '../../constants'
import { UNSUPPORTED_LIST_URLS } from '../../constants/lists'
import UNSUPPORTED_TOKEN_LIST from '../../constants/tokenLists/swapr-unsupported.tokenlist.json'
import { useActiveWeb3React } from '../../hooks'
import sortByListPriority from '../../utils/listSort'
import { AppState } from '../index'

export type TokenAddressMap = Readonly<{
  [chainId: number]: Readonly<{ [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList } }>
}>

const listCache: WeakMap<TokenList, TokenAddressMap> | null =
  typeof WeakMap !== 'undefined' ? new WeakMap<TokenList, TokenAddressMap>() : null

export function listToTokenMap(list: TokenList | null, useCache = true): TokenAddressMap {
  if (!list) return {}
  if (useCache) {
    const result = listCache?.get(list)
    if (result) return result
  }

  const map = list.tokens.reduce<TokenAddressMap>((tokenMap, tokenInfo) => {
    const token = new WrappedTokenInfo(tokenInfo, list)
    if (tokenMap[token.chainId]?.[token.address] !== undefined) {
      // Dont want to log this error in production
      // console.error(new Error(`Duplicate token! ${token.address}`))
      return tokenMap
    }
    return {
      ...tokenMap,
      [token.chainId]: {
        ...tokenMap[token.chainId],
        [token.address]: {
          token,
          list,
        },
      },
    }
  }, {})
  if (useCache) listCache?.set(list, map)
  return map
}

const selectListByUrl = (state: AppState): AppState['lists']['byUrl'] => state.lists.byUrl

export function useAllLists() {
  return useSelector(selectListByUrl)
}

const selectTokensBySymbol = createSelector(selectListByUrl, lists => {
  const allTokens = new Map<string, TokenInfo>()
  for (const key in lists) {
    lists[key]?.current?.tokens?.forEach(token => {
      allTokens.set(token.symbol.toUpperCase(), token)
    })
  }
  return allTokens
})

const selectTokensByAddress = createSelector(selectListByUrl, lists => {
  // Create a Map of ChainId and tokens in each network by Address
  const allTokensByChainId = new Map<ChainId, Map<string, TokenInfo>>()
  for (const key in lists) {
    lists[key]?.current?.tokens?.forEach(token => {
      if (allTokensByChainId.has(token.chainId)) {
        const tokenMap = allTokensByChainId.get(token.chainId)
        if (tokenMap) {
          tokenMap.set(token.address, token)
        }
      } else {
        allTokensByChainId.set(token.chainId, new Map<string, TokenInfo>())
      }
    })
  }

  // For each ChainId setting the default Token in ZeroAddress
  for (const key of allTokensByChainId.keys()) {
    const network = NETWORK_DETAIL[key]
    if (network) {
      const tokenMap = allTokensByChainId.get(key)
      tokenMap?.set(ZERO_ADDRESS, {
        chainId: key,
        address: ZERO_ADDRESS,
        ...network.nativeCurrency,
      })
    }
  }

  return allTokensByChainId
})

export function useListsByToken() {
  return useSelector(selectTokensBySymbol)
}

export function useListsByAddress() {
  return useSelector(selectTokensByAddress)
}

function combineMaps(map1: TokenAddressMap, map2: TokenAddressMap): TokenAddressMap {
  const chainList = [
    ChainId.MAINNET,
    ChainId.RINKEBY,
    ChainId.XDAI,
    ChainId.POLYGON,
    ChainId.ARBITRUM_ONE,
    ChainId.ARBITRUM_RINKEBY,
    ChainId.OPTIMISM_MAINNET,
    ChainId.OPTIMISM_GOERLI,
    ChainId.BSC_MAINNET,
  ]
  return Object.assign({}, ...chainList.map(chain => ({ [chain]: { ...map1[chain], ...map2[chain] } })))
}

// merge tokens contained within lists from urls
function useCombinedTokenMapFromUrls(urls: string[] | undefined): TokenAddressMap {
  const lists = useAllLists()
  return useMemo(() => {
    if (!urls) return {}
    return (
      urls
        .slice()
        // sort by priority so top priority goes last
        .sort(sortByListPriority)
        .reduce((allTokens, currentUrl) => {
          const current = lists[currentUrl]?.current
          if (!current) return allTokens
          try {
            return combineMaps(allTokens, listToTokenMap(current))
          } catch (error) {
            console.error('Could not show token list due to error', error)
            return allTokens
          }
        }, {})
    )
  }, [lists, urls])
}

// filter out unsupported lists
export function useActiveListUrls(): string[] | undefined {
  return useSelector<AppState, AppState['lists']['activeListUrls']>(state => state.lists.activeListUrls)?.filter(
    url => !UNSUPPORTED_LIST_URLS.includes(url)
  )
}

export function useInactiveListUrls(): string[] {
  const lists = useAllLists()
  const allActiveListUrls = useActiveListUrls()
  return Object.keys(lists).filter(url => !allActiveListUrls?.includes(url) && !UNSUPPORTED_LIST_URLS.includes(url))
}

export function useCombinedActiveList(): TokenAddressMap {
  const activeListUrls = useActiveListUrls()
  return useCombinedTokenMapFromUrls(activeListUrls)
}

export function useAllTokensFromActiveListsOnCurrentChain(): Readonly<{
  [tokenAddress: string]: { token: WrappedTokenInfo; list: TokenList }
}> {
  const { chainId } = useActiveWeb3React()
  const activeListUrls = useActiveListUrls()
  const combinedList = useCombinedTokenMapFromUrls(activeListUrls)
  return useMemo(() => combinedList[chainId || ChainId.MAINNET], [chainId, combinedList])
}

export function useTokenInfoFromActiveListOnCurrentChain(currency?: Currency): WrappedTokenInfo | undefined {
  const { chainId } = useActiveWeb3React()
  const activeListUrls = useActiveListUrls()
  const combinedList = useCombinedTokenMapFromUrls(activeListUrls)

  return useMemo(() => {
    if (!currency || !currency.address) return undefined
    const list = combinedList[chainId || ChainId.MAINNET]
    if (!list) return undefined
    const tokenFromList = list[currency.address]
    if (!tokenFromList) return undefined
    return tokenFromList.token
  }, [chainId, combinedList, currency])
}

// list of tokens not supported on interface, used to show warnings and prevent swaps and adds
export function useUnsupportedTokenList(): TokenAddressMap {
  // get hard coded unsupported tokens
  const localUnsupportedListMap = listToTokenMap(UNSUPPORTED_TOKEN_LIST)

  // get any loaded unsupported tokens
  const loadedUnsupportedListMap = useCombinedTokenMapFromUrls(UNSUPPORTED_LIST_URLS)

  // format into one token address map
  return useMemo(
    () => combineMaps(localUnsupportedListMap, loadedUnsupportedListMap),
    [localUnsupportedListMap, loadedUnsupportedListMap]
  )
}
