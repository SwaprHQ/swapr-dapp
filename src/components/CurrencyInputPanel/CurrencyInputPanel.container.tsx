import React from 'react'

import { useBridgeInputValidation } from '../../pages/Bridge/ActionPanel/useBridgeInputValidation'
import { CurrencyWrapperSource } from '../CurrencyLogo'
import { CurrencySearchModalProvider } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.container'
import {
  useCurrencySearchModalBridge,
  useCurrencySearchModalSwap,
} from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const searchModalContexts = useCurrencySearchModalSwap()

  return (
    <CurrencySearchModalProvider {...searchModalContexts}>
      <CurrencyInputPanelComponent {...currencyInputPanelProps} />
    </CurrencySearchModalProvider>
  )
}

export const CurrencyInputPanelBridge = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const searchModalContexts = useCurrencySearchModalBridge()

  const { value, onUserInput, displayedValue, disableCurrencySelect } = currencyInputPanelProps

  useBridgeInputValidation(!!disableCurrencySelect)

  return (
    <CurrencySearchModalProvider {...searchModalContexts}>
      <CurrencyInputPanelComponent
        {...currencyInputPanelProps}
        value={value}
        onUserInput={onUserInput}
        displayedValue={displayedValue}
        currencyWrapperSource={CurrencyWrapperSource.BRIDGE}
      />
    </CurrencySearchModalProvider>
  )
}
