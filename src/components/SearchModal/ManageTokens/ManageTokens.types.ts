import { Token } from '@swapr/sdk'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ManageTokensProps {
  setModalView: (view: CurrencyModalView) => void
  setImportToken: (token: Token) => void
}
