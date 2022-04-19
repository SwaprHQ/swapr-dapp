import React from 'react'
import { CurrencyModalView, CurrencySearchModalContextType } from './CurrencySearchModal.types'

export const CurrencySearchModalContext = React.createContext<CurrencySearchModalContextType>({
  importList: undefined,
  setImportList: () => null,
  listURL: undefined,
  setListUrl: () => null,
  modalView: CurrencyModalView.MANAGE,
  setModalView: () => null,
  importToken: undefined,
  setImportToken: () => null
})
