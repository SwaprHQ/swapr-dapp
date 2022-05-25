import { Currency, Token } from '@swapr/sdk'
import { TokenAddressMap } from '../../../state/lists/hooks'

export interface CurrencySearchContextType {
  allTokens: { [address: string]: Token }
  searchQuery: string
  searchToken: Token | null | undefined
  setSearchQuery: (query: string) => void
  debouncedQuery: string
  selectedTokenList: TokenAddressMap
  showFallbackTokens: boolean
}

export interface CurrencySearchProps {
  isOpen: boolean
  onDismiss: () => void
  showManageView: () => void
  showImportView: () => void
  showCommonBases?: boolean
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
  showNativeCurrency?: boolean
  otherSelectedCurrency?: Currency | null
}
