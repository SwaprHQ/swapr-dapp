import { Currency } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { CurrencySearchCoreProps } from '../CurrencySearch/CurrencySearch.types'
import { ManageListsProps } from '../ManageLists'
import { ListRowEntryProps } from '../ManageLists/ManageLists.types'

export interface CurrencySearchModalPassingProps {
  modalView: CurrencyModalView
  setModalView: (val: CurrencyModalView) => void
  importList: TokenList | undefined
  listURL: string | undefined
  currencySearchProps: CurrencySearchCoreProps
  manageListsProps: ManageListsProps
  listRowEntryProps: ListRowEntryProps
}
export interface CurrencySearchModalProps {
  isOpen: boolean
  onDismiss: () => void
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherSelectedCurrency?: Currency | null
  showCommonBases?: boolean
  showNativeCurrency?: boolean
}

export type CurrencySearchModalComponentProps = CurrencySearchModalProps & CurrencySearchModalPassingProps

export enum CurrencyModalView {
  SEARCH,
  MANAGE,
  IMPORT_TOKEN,
  IMPORT_LIST
}
