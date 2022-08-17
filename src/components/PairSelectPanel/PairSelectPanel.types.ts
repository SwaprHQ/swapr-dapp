import { ChainId, Currency, CurrencyAmount, Pair, Percent } from '@swapr/sdk'

import { CurrencyWrapperSource } from '../CurrencyLogo'

export interface PairSelectPanelProps {
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
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
  customBalanceText?: string
  isFallbackFiatValue?: boolean
  disablePairSelect?: boolean
  currencyWrapperSource?: CurrencyWrapperSource
  displayedValue?: string
  setDisplayedValue?: (val: string) => void
  maxAmount?: CurrencyAmount
}

export type PairViewProps = Pick<
  PairSelectPanelProps,
  'currency' | 'currency' | 'chainIdOverride' | 'currencyWrapperSource' | 'disablePairSelect' | 'pair'
>
export type CurrencyUserBalanceProps = Pick<
  PairSelectPanelProps,
  'hideBalance' | 'currency' | 'pair' | 'balance' | 'customBalanceText' | 'onMax'
> & {
  selectedCurrencyBalance: CurrencyAmount | undefined
}
