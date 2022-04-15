import { Currency, Token } from '@swapr/sdk'
import { TokenAddressMap } from '../../../state/lists/hooks'

export interface CurrencySearchCoreProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  debouncedQuery: string
  searchToken: Token | null | undefined
  allTokens: { [address: string]: Token }
  selectedTokenList: TokenAddressMap
  showFallbackTokens: boolean
}

export interface CurrencySearchProps extends CurrencySearchCoreProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showManageView: () => void
  showImportView: () => void
  setImportToken: (token: Token) => void
  showNativeCurrency?: boolean
}
