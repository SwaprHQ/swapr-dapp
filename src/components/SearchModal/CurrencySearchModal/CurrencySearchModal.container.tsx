import React from 'react'

import { useCurrencySearchModalSwap } from './CurrencySearchModal.hooks'

import { CurrencySearchContext } from '../CurrencySearch/CurrencySearch.context'
import { CurrencySearchModalContext } from './CurrencySearchModal.context'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { ManageListsContext, ListRowContext } from '../ManageLists/ManageLists.context'

import { CurrencySearchModalProps, CurrencySearchModalProviderProps } from './CurrencySearchModal.types'

export const CurrencySearchModalProvider: React.FC<CurrencySearchModalProviderProps> = ({
  children,
  listRowContext,
  manageListsContext,
  currencySearchContext,
  currencySearchModalContext,
}) => {
  return (
    <CurrencySearchModalContext.Provider value={currencySearchModalContext}>
      <CurrencySearchContext.Provider value={currencySearchContext}>
        <ManageListsContext.Provider value={manageListsContext}>
          <ListRowContext.Provider value={listRowContext}>{children}</ListRowContext.Provider>
        </ManageListsContext.Provider>
      </CurrencySearchContext.Provider>
    </CurrencySearchModalContext.Provider>
  )
}

export const CurrencySearchModal = (props: CurrencySearchModalProps) => {
  const {
    listRowContext,
    manageListsContext,
    currencySearchContext,
    currencySearchModalContext,
  } = useCurrencySearchModalSwap()

  return (
    <CurrencySearchModalProvider
      listRowContext={listRowContext}
      manageListsContext={manageListsContext}
      currencySearchContext={currencySearchContext}
      currencySearchModalContext={currencySearchModalContext}
    >
      <CurrencySearchModalComponent {...props} />
    </CurrencySearchModalProvider>
  )
}
