import React, { PropsWithChildren } from 'react'

import { CurrencySearchContext } from '../CurrencySearch/CurrencySearch.context'
import { ListRowContext, ManageListsContext } from '../ManageLists/ManageLists.context'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { CurrencySearchModalContext } from './CurrencySearchModal.context'
import { useCurrencySearchModalSwap } from './CurrencySearchModal.hooks'
import { CurrencySearchModalProps, CurrencySearchModalProviderProps } from './CurrencySearchModal.types'

export function CurrencySearchModalProvider({
  children,
  listRowContext,
  manageListsContext,
  currencySearchContext,
  currencySearchModalContext,
}: PropsWithChildren<CurrencySearchModalProviderProps>) {
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

export function CurrencySearchModal(props: CurrencySearchModalProps) {
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
