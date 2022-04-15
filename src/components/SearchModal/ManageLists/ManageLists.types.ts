import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageListsEntryProps {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}

export interface ManageListsProps {
  listUrlInput: string
  handleInput: (e: any) => void
  addError: string | undefined
  tempList: TokenList | undefined
  isImported: boolean
  handleImport: () => void
  renderableLists: string[]
}

export interface ManageListsPassingProps {
  listRowEntryProps: ListRowEntryProps
}

export type ManageListsComponentProps = ManageListsProps & ManageListsPassingProps

export interface ListRowEntryProps {
  isActiveList: (url: string) => boolean
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

export interface ListRowProps extends ListRowEntryProps {
  listUrl: string
}
