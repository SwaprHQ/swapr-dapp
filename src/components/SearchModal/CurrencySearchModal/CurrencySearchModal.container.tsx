import React from 'react'
import { useCurrencySearchCore } from '../CurrencySearch/CurrencySearch.hooks'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModal = (props: CurrencySearchModalProps) => {
  const currencySearchProps = useCurrencySearchCore()

  return <CurrencySearchModalComponent {...props} currencySearchProps={currencySearchProps} />
}
