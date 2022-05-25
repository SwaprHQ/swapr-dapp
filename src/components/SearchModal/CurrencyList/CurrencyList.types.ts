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
  fixedListRef?: MutableRefObject<FixedSizeList | undefined>
  otherCurrency?: Currency | null
  setImportToken: (token: Token) => void
  showImportView: () => void
  otherListTokens: Token[]
  onCurrencySelect: (currency: Currency) => void
  selectedCurrency?: Currency | null
  selectedTokenList: TokenAddressMap
}

export interface CurrencyRowProps {
  style: CSSProperties
  balance: CurrencyAmount | undefined
  onSelect: () => void
  currency: Currency
  isSelected: boolean
  otherSelected: boolean
  selectedTokenList: TokenAddressMap
}
