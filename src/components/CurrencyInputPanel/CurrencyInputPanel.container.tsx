import React, { useState } from 'react'
import { CurrencyInputPanelProps } from './CurrencyInputPanel.types'
import { CurrencyInputPanelComponent } from './CurrencyInputPanel.component'
import { useCurrencySearchCore } from '../SearchModal/CurrencySearch/CurrencySearch.hooks'
import { TokenList } from '@uniswap/token-lists'
import { CurrencyModalView } from '../SearchModal/CurrencySearchModal'
import { useListRowEntryPropsSwap, useManageLists } from '../SearchModal/ManageLists/ManageLists.hooks'

export const CurrencyInputPanel = (currencyInputPanelProps: CurrencyInputPanelProps) => {
  // Shared between ManageLists and ImportList
  const [listURL, setListUrl] = useState<string | undefined>()
  const [importList, setImportList] = useState<TokenList | undefined>()

  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.MANAGE)

  const currencySearchProps = useCurrencySearchCore()
  const manageListsProps = useManageLists({ setImportList, setListUrl, setModalView })
  const listRowEntryProps = useListRowEntryPropsSwap()

  return (
    <CurrencyInputPanelComponent
      {...currencyInputPanelProps}
      importList={importList}
      listURL={listURL}
      manageListsProps={manageListsProps}
      modalView={modalView}
      setModalView={setModalView}
      currencySearchProps={currencySearchProps}
      listRowEntryProps={listRowEntryProps}
    />
  )
}
