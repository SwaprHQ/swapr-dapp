import React, { useCallback, useContext, useEffect } from 'react'
import { Currency } from '@swapr/sdk'

import useLast from '../../../hooks/useLast'
import usePrevious from '../../../hooks/usePrevious'

import Modal from '../../Modal'
import { Manage } from '../Manage'
import { ImportList } from '../ImportList'
import { ImportToken } from '../ImportToken'
import { CurrencySearch } from '../CurrencySearch'

import { CurrencySearchModalContext } from './CurrencySearchModal.context'

import { CurrencyModalView, CurrencySearchModalProps } from './CurrencySearchModal.types'

export const CurrencySearchModalComponent = ({
  isOpen,
  onDismiss,
  onCurrencySelect: onCurrencySelectWithoutDismiss,
  selectedCurrency,
  otherSelectedCurrency,
  showCommonBases = false,
  showNativeCurrency = true,
}: CurrencySearchModalProps) => {
  const lastOpen = useLast(isOpen)
  const { modalView, setModalView, importList, listURL, importToken } = useContext(CurrencySearchModalContext)

  useEffect(() => {
    if (isOpen && !lastOpen) {
      setModalView(CurrencyModalView.SEARCH)
    }
  }, [isOpen, lastOpen, setModalView])

  const onCurrencySelect = useCallback(
    (currency: Currency) => {
      onCurrencySelectWithoutDismiss(currency)
      onDismiss()
    },
    [onDismiss, onCurrencySelectWithoutDismiss]
  )

  // for token import view
  const prevView = usePrevious(modalView)

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
          showManageView={() => setModalView(CurrencyModalView.MANAGE)}
          showNativeCurrency={showNativeCurrency}
        />
      ) : modalView === CurrencyModalView.IMPORT_TOKEN && importToken ? (
        <ImportToken
          onDismiss={onDismiss}
          onCurrencySelect={onCurrencySelect}
          onBack={() =>
            setModalView(prevView && prevView !== CurrencyModalView.IMPORT_TOKEN ? prevView : CurrencyModalView.SEARCH)
          }
        />
      ) : modalView === CurrencyModalView.IMPORT_LIST && importList && listURL ? (
        <ImportList
          onDismiss={onDismiss}
          onBack={() =>
            setModalView(prevView && prevView !== CurrencyModalView.IMPORT_LIST ? prevView : CurrencyModalView.MANAGE)
          }
        />
      ) : modalView === CurrencyModalView.MANAGE ? (
        <Manage onDismiss={onDismiss} />
      ) : (
        ''
      )}
    </Modal>
  )
}
