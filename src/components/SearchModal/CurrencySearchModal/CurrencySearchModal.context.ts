import React from 'react'
import { CurrencyModalView, CurrencySearchModalContextType } from './CurrencySearchModal.types'

export const CurrencySearchModalContext = React.createContext<CurrencySearchModalContextType>({
  listURL: undefined,
  modalView: CurrencyModalView.MANAGE,
  setListUrl: () => null,
  importList: undefined,
  importToken: undefined,
  setModalView: () => null,
  setImportList: () => null,
  setImportToken: () => null,
})
