import React from 'react'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { useCurrencySearchModalSwap } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const currencySearchModalProps = useCurrencySearchModalSwap()

  return <CurrencyInputPanelComponent {...currencyInputPanelProps} {...currencySearchModalProps} />
}
