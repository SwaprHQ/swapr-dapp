import { Currency, Pair, CurrencyAmount, Percent, ChainId } from '@swapr/sdk'
import { CurrencyWrapperSource } from '../CurrencyLogo'

export interface CurrencyInputPanelProps {
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
  currencyWrapperSource?: CurrencyWrapperSource
  // Used by bridge context. Find better way
  displayedValue?: string
  setDisplayedValue?: (val: string) => void
}
