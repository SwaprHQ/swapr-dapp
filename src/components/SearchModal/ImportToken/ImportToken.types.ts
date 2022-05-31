import { Currency } from '@swapr/sdk'

export interface ImportTokenProps {
  onBack: () => void
  onDismiss: () => void
  onCurrencySelect?: (currency: Currency) => void
}
