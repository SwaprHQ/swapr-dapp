import { useState } from 'react'
import { Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'

import {
  useManageListsContextSwap,
  useListRowContextSwap,
  useListRowContextBridge,
  useManageListsContextBridge,
} from '../ManageLists/ManageLists.hooks'
import { useCurrencySearchContextBridge, useCurrencySearchContextSwap } from '../CurrencySearch/CurrencySearch.hooks'

import { CurrencyModalView, CurrencySearchModalContextType } from './CurrencySearchModal.types'

export const useCurrencySearchModalContext = (): CurrencySearchModalContextType => {
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [importToken, setImportToken] = useState<Token | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.MANAGE)

  return {
    listURL,
    setListUrl,
    modalView,
    setModalView,
    importList,
    setImportList,
    importToken,
    setImportToken,
  }
}

export const useCurrencySearchModalSwap = () => {
  const currencySearchModalContext = useCurrencySearchModalContext()
  const { setImportList, setListUrl, setModalView } = currencySearchModalContext
  const listRowContext = useListRowContextSwap()
  const currencySearchContext = useCurrencySearchContextSwap()
  const manageListsContext = useManageListsContextSwap({ setImportList, setListUrl, setModalView })

  return {
    listRowContext,
    manageListsContext,
    currencySearchContext,
    currencySearchModalContext,
  }
}

export const useCurrencySearchModalBridge = () => {
  const currencySearchModalContext = useCurrencySearchModalContext()
  const listRowContext = useListRowContextBridge()
  const manageListsContext = useManageListsContextBridge()
  const currencySearchContext = useCurrencySearchContextBridge()

  return {
    listRowContext,
    manageListsContext,
    currencySearchContext,
    currencySearchModalContext,
  }
}
