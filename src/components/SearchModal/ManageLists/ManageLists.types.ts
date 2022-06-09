import { TokenList } from '@uniswap/token-lists'
import { ListsState } from '../../../state/lists/reducer'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageListsProps {
  setListUrl: (url: string) => void
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
}

export interface ManageListsContextType {
  addError?: string
  tempList?: TokenList
  isImported?: boolean
  handleInput?: (e: any) => void
  listUrlInput?: string
  handleImport?: () => void
  renderableLists: string[]
  disableListImport?: boolean
}
export interface ListRowProps {
  listUrl: string
}

export interface ListRowContextType {
  listsByUrl: ListsState['byUrl']
  isActiveList: (url: string) => boolean
  disableListInfo: boolean
  handleRemoveList: (url: string) => void
  handleEnableList: (url: string) => void
  handleDisableList: (url: string) => void
  handleAcceptListUpdate: (url: string) => void
}
