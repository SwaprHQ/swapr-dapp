import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageListsProps {
  setModalView: (view: CurrencyModalView) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}
