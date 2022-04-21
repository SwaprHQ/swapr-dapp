import { Currency, Pair, CurrencyAmount, Percent, ChainId } from '@swapr/sdk'
import { CurrencyWrapperSource } from '../CurrencyLogo'

export interface CurrencyInputPanelProps {
  id: string
  pair?: Pair | null
  onMax?: () => void
  value: string
  label?: string
  balance?: CurrencyAmount
  currency?: Currency | null
  disabled?: boolean
  hideInput?: boolean
  fiatValue?: CurrencyAmount | null
  isLoading?: boolean
  onUserInput: (value: string) => void
  hideBalance?: boolean
  priceImpact?: Percent
  otherCurrency?: Currency | null
  chainIdOverride?: ChainId
  showCommonBases?: boolean
  onCurrencySelect?: (currency: Currency) => void
  customBalanceText?: string
  disableCurrencySelect?: boolean
  currencyWrapperSource?: CurrencyWrapperSource
  // Used by bridge context. Find better way
  displayedValue?: string
  setDisplayedValue?: (val: string) => void
}
