import { Currency, Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'

export interface ImportTokenProps {
  tokens: Token[]
  list?: TokenList
  onBack: () => void
  onDismiss: () => void
  onCurrencySelect?: (currency: Currency) => void
}
