import { Currency, Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { CurrencySearchContextType } from '../CurrencySearch/CurrencySearch.types'
import { ListRowContextType, ManageListsContextType } from '../ManageLists/ManageLists.types'

export interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  showCommonBases?: boolean
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
  showNativeCurrency?: boolean
  otherSelectedCurrency?: Currency | null
}

export enum CurrencyModalView {
  SEARCH,
  MANAGE,
  IMPORT_TOKEN,
  IMPORT_LIST,
}

// Shared props
export interface CurrencySearchModalContextType {
  listURL: string | undefined
  modalView: CurrencyModalView
  setListUrl: (listUrl: string | undefined) => void
  importList: TokenList | undefined
  importToken: Token | undefined
  setModalView: (val: CurrencyModalView) => void
  setImportList: (importList: TokenList | undefined) => void
  setImportToken: (importToken: Token | undefined) => void
}

export interface CurrencySearchModalProviderProps {
  listRowContext: ListRowContextType
  manageListsContext: ManageListsContextType
  currencySearchContext: CurrencySearchContextType
  currencySearchModalContext: CurrencySearchModalContextType
}
