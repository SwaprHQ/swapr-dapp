import React, { useCallback, useEffect, useState } from 'react'
import { Currency, Token } from '@swapr/sdk'
import { TokenList } from '@uniswap/token-lists'

import useLast from '../../../hooks/useLast'
import usePrevious from '../../../hooks/usePrevious'

import Modal from '../../Modal'
import { CurrencySearch } from '../CurrencySearch'
import { ImportList } from '../ImportList'
import { ImportToken } from '../ImportToken'
import { Manage } from '../Manage'
import { WrappedTokenInfo } from '../../../state/lists/wrapped-token-info'
import { CurrencyModalView, CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModal = ({
  isOpen,
  onDismiss,
  onCurrencySelect: onCurrencySelectWithoutDismiss,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
  showNativeCurrency = true,
  currencySearchProps
}: CurrencySearchModalProps) => {
  const [modalView, setModalView] = useState<CurrencyModalView>(CurrencyModalView.MANAGE)
  const lastOpen = useLast(isOpen)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.SEARCH)
    }
  }, [isOpen, lastOpen])

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelectWithoutDismiss(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelectWithoutDismiss]
  )

  // for token import view
  const prevView = usePrevious(modalView)

  // used for import token flow
  const [importToken, setImportToken] = useState<Token | undefined>()

  // used for import list
  const [importList, setImportList] = useState<TokenList | undefined>()
  const [listURL, setListUrl] = useState<string | undefined>()

  return (
    <Modal
      isOpen={isOpen}
      onDismiss={onDismiss}
      maxHeight={60}
      minHeight={
        modalView === CurrencyModalView.IMPORT_TOKEN || modalView === CurrencyModalView.IMPORT_LIST ? undefined : 60
      }
    >
      {modalView === CurrencyModalView.SEARCH ? (
        <CurrencySearch
          isOpen={isOpen}
          onDismiss={onDismiss}
          onCurrencySelect={onCurrencySelect}
          selectedCurrency={selectedCurrency}
          otherSelectedCurrency={otherSelectedCurrency}
          showCommonBases={showCommonBases}
          showImportView={() => setModalView(CurrencyModalView.IMPORT_TOKEN)}
          setImportToken={setImportToken}
          showManageView={() => setModalView(CurrencyModalView.MANAGE)}
          showNativeCurrency={showNativeCurrency}
          {...currencySearchProps}
        />
      ) : modalView === CurrencyModalView.IMPORT_TOKEN && importToken ? (
        <ImportToken
          tokens={[importToken]}
          onDismiss={onDismiss}
          list={importToken instanceof WrappedTokenInfo ? importToken.list : undefined}
          onBack={() =>
            setModalView(prevView && prevView !== CurrencyModalView.IMPORT_TOKEN ? prevView : CurrencyModalView.SEARCH)
          }
          onCurrencySelect={onCurrencySelect}
        />
      ) : modalView === CurrencyModalView.IMPORT_LIST && importList && listURL ? (
        <ImportList
          list={importList}
          listURI={listURL}
          onDismiss={onDismiss}
          setModalView={setModalView}
          onBack={() =>
            setModalView(prevView && prevView !== CurrencyModalView.IMPORT_LIST ? prevView : CurrencyModalView.MANAGE)
          }
        />
      ) : modalView === CurrencyModalView.MANAGE ? (
        <Manage
          onDismiss={onDismiss}
          setModalView={setModalView}
          setImportToken={setImportToken}
          setImportList={setImportList}
          setListUrl={setListUrl}
        />
      ) : (
        ''
      )}
    </Modal>
  )
}
