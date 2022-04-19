import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageListsProps {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}

export interface ManageListsContextType {
  listUrlInput?: string
  handleInput?: (e: any) => void
  addError?: string
  tempList?: TokenList
  isImported?: boolean
  handleImport?: () => void
  renderableLists: string[]
  disableListImport?: boolean
}
export interface ListRowProps {
  listUrl: string
}

export interface ListRowContextType {
  isActiveList: (url: string) => boolean
  disableListInfo: boolean
  listsByUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly pendingUpdate: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  handleAcceptListUpdate: (url: string) => void
  handleRemoveList: (url: string) => void
  handleEnableList: (url: string) => void
  handleDisableList: (url: string) => void
}
