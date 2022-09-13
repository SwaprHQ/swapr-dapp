import { Currency } from '@swapr/sdk'

export interface BalanceTokensProps {
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
  filteredSortedTokensWithNativeCurrency: Currency[]
  limit?: number
}
