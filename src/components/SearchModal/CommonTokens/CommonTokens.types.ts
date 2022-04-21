import { ChainId, Currency } from '@swapr/sdk'

export interface CommonTokensProps {
  chainId?: ChainId
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
}
