import React, { useCallback, useEffect, useMemo } from 'react'
import debounce from 'lodash.debounce'

import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'

import { CurrencySearchContext } from '../SearchModal/CurrencySearch/CurrencySearch.context'
import { ListRowContext, ManageListsContext } from '../SearchModal/ManageLists/ManageLists.context'
import { CurrencySearchModalContext } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.context'

import {
  useCurrencySearchModalBridge,
  useCurrencySearchModalSwap
} from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { useBridgeInputValidation } from '../../pages/Bridge/ActionPanel/useBridgeInputValidation'

import { CurrencyWrapperSource } from '../CurrencyLogo'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const {
    manageListsContext,
    listRowContext,
    currencySearchContext,
    currencySearchModalContext
  } = useCurrencySearchModalSwap()

  return (
    <CurrencySearchModalContext.Provider value={currencySearchModalContext}>
      <CurrencySearchContext.Provider value={currencySearchContext}>
        <ManageListsContext.Provider value={manageListsContext}>
          <ListRowContext.Provider value={listRowContext}>
            <CurrencyInputPanelComponent {...currencyInputPanelProps} />
          </ListRowContext.Provider>
        </ManageListsContext.Provider>
      </CurrencySearchContext.Provider>
    </CurrencySearchModalContext.Provider>
  )
}

export const CurrencyInputPanelBridge = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  const {
    manageListsContext,
    listRowContext,
    currencySearchContext,
    currencySearchModalContext
  } = useCurrencySearchModalBridge()

  const {
    value: valueRaw,
    onUserInput: onUserInputRaw,
    displayedValue,
    setDisplayedValue,
    disableCurrencySelect
  } = currencyInputPanelProps

  const debounceOnUserInput = useMemo(() => {
    return debounce(onUserInputRaw, 500)
  }, [onUserInputRaw])

  const onUserInput = useCallback(
    (val: string) => {
      setDisplayedValue && setDisplayedValue(val)
      debounceOnUserInput(val)
    },
    [debounceOnUserInput, setDisplayedValue]
  )

  const value = useMemo(() => (disableCurrencySelect ? valueRaw : displayedValue ?? ''), [
    disableCurrencySelect,
    displayedValue,
    valueRaw
  ])

  useEffect(() => {
    debounceOnUserInput.cancel()
  }, [debounceOnUserInput, disableCurrencySelect])

  useBridgeInputValidation(!!disableCurrencySelect)

  return (
    <CurrencySearchModalContext.Provider value={currencySearchModalContext}>
      <CurrencySearchContext.Provider value={currencySearchContext}>
        <ManageListsContext.Provider value={manageListsContext}>
          <ListRowContext.Provider value={listRowContext}>
            <CurrencyInputPanelComponent
              {...currencyInputPanelProps}
              onUserInput={onUserInput}
              displayedValue={displayedValue}
              value={value}
              currencyWrapperSource={CurrencyWrapperSource.BRIDGE}
            />
          </ListRowContext.Provider>
        </ManageListsContext.Provider>
      </CurrencySearchContext.Provider>
    </CurrencySearchModalContext.Provider>
  )
}
