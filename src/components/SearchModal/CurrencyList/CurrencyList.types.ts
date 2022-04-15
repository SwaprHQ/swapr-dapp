import { CSSProperties, MutableRefObject } from 'react'
import { Currency, CurrencyAmount, Token } from '@swapr/sdk'
import { FixedSizeList } from 'react-window'
import { TokenAddressMap } from '../../../state/lists/hooks'

export const BREAK_LINE = 'BREAK'
type BreakLine = typeof BREAK_LINE

export function isBreakLine(x: unknown): x is BreakLine {
  return x === BREAK_LINE
}

export interface CurrencyListProps {
  currencies: Currency[]
  selectedCurrency?: Currency | null
  onCurrencySelect: (currency: Currency) => void
  otherCurrency?: Currency | null
  otherListTokens: Token[]
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  showImportView: () => void
  setImportToken: (token: Token) => void
  selectedTokenList: TokenAddressMap
}

export interface CurrencyRowProps {
  currency: Currency
  balance: CurrencyAmount | undefined
  selectedTokenList: TokenAddressMap
  onSelect: () => void
  isSelected: boolean
  otherSelected: boolean
  style: CSSProperties
}
