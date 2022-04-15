import React from 'react'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { useCurrencySearchCore } from '../SearchModal/CurrencySearch/CurrencySearch.hooks'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const currencySearchProps = useCurrencySearchCore()

  return <CurrencyInputPanelComponent {...currencyInputPanelProps} currencySearchProps={currencySearchProps} />
}
