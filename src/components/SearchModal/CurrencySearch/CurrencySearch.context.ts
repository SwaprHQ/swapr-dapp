import { createContext } from 'react'

import { CurrencySearchContextType } from './CurrencySearch.types'

export const CurrencySearchContext = createContext<CurrencySearchContextType>({
  allTokens: {},
  allTokensOnSecondChain: {},
  searchQuery: '',
  searchToken: undefined,
  debouncedQuery: '',
  setSearchQuery: () => null,
  selectedTokenList: {},
  showFallbackTokens: false,
})
