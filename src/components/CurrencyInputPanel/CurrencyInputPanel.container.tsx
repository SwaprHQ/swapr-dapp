import React from 'react'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { useCurrencySearchModalSwap } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.hooks'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'
import { ListRowContext, ManageListsContext } from '../SearchModal/ManageLists/ManageLists.context'
import { CurrencySearchContext } from '../SearchModal/CurrencySearch/CurrencySearch.context'
import { CurrencySearchModalContext } from '../SearchModal/CurrencySearchModal/CurrencySearchModal.context'

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
