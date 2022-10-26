import { ChainId, Currency, CurrencyAmount, Pair, Percent } from '@swapr/sdk'

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
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
  customBalanceText?: string
  isFallbackFiatValue?: boolean
  disableCurrencySelect?: boolean
  currencyWrapperSource?: CurrencyWrapperSource
  displayedValue?: string
  setDisplayedValue?: (val: string) => void
  maxAmount?: CurrencyAmount
  isOutputPanel?: boolean
  inputType?: InputType
  onPairSelect?: (pair: Pair) => void
  filterPairs?: (pair: Pair) => boolean
}

export type CurrencyViewProps = Pick<
  CurrencyInputPanelProps,
  'currency' | 'currency' | 'chainIdOverride' | 'currencyWrapperSource' | 'disableCurrencySelect' | 'pair' | 'inputType'
>
export type CurrencyUserBalanceProps = Pick<
  CurrencyInputPanelProps,
  'hideBalance' | 'currency' | 'pair' | 'balance' | 'customBalanceText' | 'onMax'
> & {
  selectedCurrencyBalance: CurrencyAmount | undefined
}

export enum InputType {
  currency,
  pair,
}
