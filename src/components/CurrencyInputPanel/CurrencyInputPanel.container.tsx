import React, { useCallback, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'

import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'

import {
  useCurrencySearchModalSwap,
  useCurrencySearchModalBridge,
} from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { useBridgeInputValidation } from '../../pages/Bridge/ActionPanel/useBridgeInputValidation'

import { CurrencyWrapperSource } from '../CurrencyLogo'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

import { CurrencySearchModalProvider } from '../SearchModal/CurrencySearchModal'
import { normalizeInputValue } from '../../utils'

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

  const {
    value: valueRaw,
    onUserInput: onUserInputRaw,
    displayedValue,
    setDisplayedValue,
    disableCurrencySelect,
  } = currencyInputPanelProps

  const debounceOnUserInput = useMemo(() => {
    return debounce(onUserInputRaw, 500)
  }, [onUserInputRaw])

  const onUserInput = useCallback(
    (val: string) => {
      const normalizedValue = normalizeInputValue(val)

      setDisplayedValue?.(normalizedValue)
      debounceOnUserInput(normalizedValue)
    },
    [debounceOnUserInput, setDisplayedValue]
  )

  const value = disableCurrencySelect ? valueRaw : displayedValue ?? ''

  useEffect(() => {
    debounceOnUserInput.cancel()
  }, [debounceOnUserInput, disableCurrencySelect])

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
