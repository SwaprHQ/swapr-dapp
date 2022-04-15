import { Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageProps {
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
  setImportList: (list: TokenList) => void
  setListUrl: (url: string) => void
}
