import { ChainId, Currency } from '@swapr/sdk'

export interface CommonTokensProps {
  chainId?: ChainId
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
}
