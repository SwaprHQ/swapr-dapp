import React from 'react'
import { CurrencySearchContextType } from './CurrencySearch.types'

export const CurrencySearchContext = React.createContext<CurrencySearchContextType>({
  allTokens: {},
  debouncedQuery: '',
  searchQuery: '',
  searchToken: undefined,
  selectedTokenList: {},
  setSearchQuery: () => null,
  showFallbackTokens: false
})
