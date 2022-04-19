import React from 'react'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { useCurrencySearchModalSwap } from './CurrencySearchModal.hooks'
import { CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModal = (props: CurrencySearchModalProps) => {
  const currencySearchModalProps = useCurrencySearchModalSwap()

  return <CurrencySearchModalComponent {...props} {...currencySearchModalProps} />
}
