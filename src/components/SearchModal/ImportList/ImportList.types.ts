import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../CurrencySearchModal'

export interface ImportListProps {
  listURI: string
  list?: TokenList
  onBack: () => void
  onDismiss: () => void
  setModalView: (view: CurrencyModalView) => void
}
