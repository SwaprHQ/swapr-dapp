import { TokenList } from '@uniswap/token-lists'
import React, { useState } from 'react'
import { useCurrencySearchCore } from '../CurrencySearch/CurrencySearch.hooks'
import { useListRowEntryPropsSwap, useManageLists } from '../ManageLists/ManageLists.hooks'
import { CurrencySearchModalComponent } from './CurrencySearchModal.component'
import { CurrencyModalView, CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModal = (props: CurrencySearchModalProps) => {
  // Shared between ManageLists and ImportList
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.MANAGE)

  const currencySearchProps = useCurrencySearchCore()
  const manageListsProps = useManageLists({ setImportList, setListUrl, setModalView })
  const listRowEntryProps = useListRowEntryPropsSwap()

  return (
    <CurrencySearchModalComponent
      {...props}
      listURL={listURL}
      importList={importList}
      modalView={modalView}
      setModalView={setModalView}
      currencySearchProps={currencySearchProps}
      listRowEntryProps={listRowEntryProps}
      manageListsProps={manageListsProps}
    />
  )
}
