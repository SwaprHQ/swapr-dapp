import { Token } from '@swapr/sdk'
import { CurrencyModalView } from '../CurrencySearchModal'
import { ManageListsProps } from '../ManageLists'
import { ListRowEntryProps } from '../ManageLists/ManageLists.types'

export interface ManageProps {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  manageListsProps: ManageListsProps
  listRowEntryProps: ListRowEntryProps
}
