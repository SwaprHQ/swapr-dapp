import React from 'react'

import { useCurrencySearchModalSwap } from './CurrencySearchModal.hooks'

import { CurrencySearchContext } from '../CurrencySearch/CurrencySearch.context'
import { CurrencySearchModalContext } from './CurrencySearchModal.context'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { ManageListsContext, ListRowContext } from '../ManageLists/ManageLists.context'

import { CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModal = (props: CurrencySearchModalProps) => {
  const {
    listRowContext,
    manageListsContext,
    currencySearchContext,
    currencySearchModalContext
  } = useCurrencySearchModalSwap()

  return (
    <CurrencySearchModalContext.Provider value={currencySearchModalContext}>
      <CurrencySearchContext.Provider value={currencySearchContext}>
        <ManageListsContext.Provider value={manageListsContext}>
          <ListRowContext.Provider value={listRowContext}>
            <CurrencySearchModalComponent {...props} />
          </ListRowContext.Provider>
        </ManageListsContext.Provider>
      </CurrencySearchContext.Provider>
    </CurrencySearchModalContext.Provider>
  )
}
