import { Currency, Pair, CurrencyAmount, Percent, ChainId } from '@swapr/sdk'
import { CurrencySearchCoreProps } from '../SearchModal/CurrencySearch/CurrencySearch.types'

export interface CurrencyInputPanelComponentProps {
  value: string
  onUserInput: (value: string) => void
  onMax?: () => void
  label?: string
  onCurrencySelect?: (currency: Currency) => void
  currency?: Currency | null
  disableCurrencySelect?: boolean
  disabled?: boolean
  hideBalance?: boolean
  pair?: Pair | null
  hideInput?: boolean
  otherCurrency?: Currency | null
  id: string
  showCommonBases?: boolean
  customBalanceText?: string
  balance?: CurrencyAmount
  fiatValue?: CurrencyAmount | null
  priceImpact?: Percent
  isLoading?: boolean
  chainIdOverride?: ChainId
  currencySearchProps: CurrencySearchCoreProps
}

export type CurrencyInputPanelProps = Omit<CurrencyInputPanelComponentProps, 'currencySearchProps'>
