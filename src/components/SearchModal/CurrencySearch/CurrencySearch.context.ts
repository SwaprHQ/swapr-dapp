import React from 'react'

import { CurrencySearchContextType } from './CurrencySearch.types'

export const CurrencySearchContext = React.createContext<CurrencySearchContextType>({
  allTokens: {},
  allTokensOnSecondChain: undefined,
  searchQuery: '',
  searchToken: undefined,
  debouncedQuery: '',
  setSearchQuery: () => null,
  selectedTokenList: {},
  showFallbackTokens: false,
})
