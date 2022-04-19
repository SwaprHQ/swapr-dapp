import { Currency, Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'

export interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showNativeCurrency?: boolean
}

export enum CurrencyModalView {
  SEARCH,
  MANAGE,
  IMPORT_TOKEN,
  IMPORT_LIST
}

// Shared props
export interface CurrencySearchModalContextType {
  modalView: CurrencyModalView
  setModalView: (val: CurrencyModalView) => void
  importList: TokenList | undefined
  setImportList: (importList: TokenList | undefined) => void
  listURL: string | undefined
  setListUrl: (listUrl: string | undefined) => void
  importToken: Token | undefined
  setImportToken: (importToken: Token | undefined) => void
}
