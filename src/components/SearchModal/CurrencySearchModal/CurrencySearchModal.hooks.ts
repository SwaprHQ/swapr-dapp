import { useState } from 'react'
import { TokenList } from '@uniswap/token-lists'
import { useCurrencySearchCore } from '../CurrencySearch/CurrencySearch.hooks'
import { useManageLists, useListRowEntryPropsSwap } from '../ManageLists/ManageLists.hooks'

import { CurrencyModalView } from './CurrencySearchModal.types'

export const useCurrencySearchModalSwap = () => {
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.MANAGE)

  const currencySearchProps = useCurrencySearchCore()
  const manageListsProps = useManageLists({ setImportList, setListUrl, setModalView })
  const listRowEntryProps = useListRowEntryPropsSwap()

  return {
    listURL,
    importList,
    modalView,
    setModalView,
    currencySearchProps,
    listRowEntryProps,
    manageListsProps
  }
}
