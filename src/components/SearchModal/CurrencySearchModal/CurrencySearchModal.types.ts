import { Currency } from '@swapr/sdk'
import { CurrencySearchCoreProps } from '../CurrencySearch/CurrencySearch.types'

export interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showNativeCurrency?: boolean
  currencySearchProps: CurrencySearchCoreProps
}

export enum CurrencyModalView {
  SEARCH,
  MANAGE,
  IMPORT_TOKEN,
  IMPORT_LIST
}
