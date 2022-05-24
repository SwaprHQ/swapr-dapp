import { useState } from 'react'

import {
  useBridgeToken,
  useBridgeActiveTokenMap,
  useBridgeSupportedTokens,
} from '../../../services/EcoBridge/EcoBridge.hooks'
import useDebounce from '../../../hooks/useDebounce'
import { useAllTokens, useToken } from '../../../hooks/Tokens'
import { useCombinedActiveList } from '../../../state/lists/hooks'

export const useCurrencySearchContextSwap = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const searchToken = useToken(debouncedQuery)
  const allTokens = useAllTokens()
  const selectedTokenList = useCombinedActiveList()
  const showFallbackTokens = true

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchToken,
    allTokens,
    selectedTokenList,
    showFallbackTokens,
  }
}

export const useCurrencySearchContextBridge = () => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const debouncedQuery = useDebounce(searchQuery, 200)
  const searchToken = useBridgeToken(debouncedQuery)
  const allTokens = useBridgeSupportedTokens()
  const selectedTokenList = useBridgeActiveTokenMap()
  const showFallbackTokens = false

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    searchToken,
    allTokens,
    selectedTokenList,
    showFallbackTokens,
  }
}
