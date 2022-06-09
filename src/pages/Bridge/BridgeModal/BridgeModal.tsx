import React, { useState, useEffect } from 'react'
import { BridgeModalContent } from './BridgeModalContent'
import { BridgeModalState, BridgeModalStatus } from '../../../services/EcoBridge/EcoBridge.types'
import { getNetworkInfo } from '../../../utils/networksList'
import { BridgeModalType } from './BridgeModal.types'
import { useSelector } from 'react-redux'
import { AppState } from '../../../state'
import { useTranslation } from 'react-i18next'

export interface BridgeModalProps {
  handleResetBridge: () => void
  setIsCollecting: (collecting: boolean) => void
  setStatus: (status: BridgeModalStatus, error?: string) => void
  modalData: BridgeModalState
  handleSubmit: () => void
}

export const BridgeModal = ({
  handleResetBridge,
  setIsCollecting,
  setStatus,
  modalData,
  handleSubmit,
}: BridgeModalProps) => {
  const [heading, setHeading] = useState('')
  const [disableConfirm, setDisableConfirm] = useState(false)
  const [modalType, setModalType] = useState<BridgeModalType | null>(null)
  const [isWarning, setIsWarning] = useState(false)
  const [bridgeName, setBridgeName] = useState('')

  const { t } = useTranslation()
  const { status, symbol, typedValue, fromChainId, toChainId, error } = modalData

  const { name: fromNetworkName } = getNetworkInfo(fromChainId)
  const { name: toNetworkName } = getNetworkInfo(toChainId)

  const activeBridge = useSelector((state: AppState) => state.ecoBridge.common.activeBridge)

  const text = t('bridgeModalText', { typedValue, symbol: symbol ?? '', fromNetworkName, toNetworkName })

  useEffect(() => {
    setDisableConfirm(false)
    switch (status) {
      case BridgeModalStatus.INITIATED:
        setModalType('initiated')
        setHeading(t('bridgeHeadingInitiated'))
        break
      case BridgeModalStatus.PENDING:
        setModalType('pending')
        break
      case BridgeModalStatus.COLLECTING:
        setModalType('collecting')
        setHeading(t('bridgeHeadingCollecting'))
        break
      case BridgeModalStatus.SUCCESS:
        setModalType('success')
        setHeading(t('bridgeHeadingSuccess'))
        break
      case BridgeModalStatus.ERROR:
        setModalType('error')
        break
      case BridgeModalStatus.DISCLAIMER:
        setHeading(t('bridgeHeadingDisclaimer', { typedValue, symbol: symbol ?? '' }))
        setModalType('disclaimer')
        break

      default:
        setModalType(null)
    }

    if (activeBridge === 'socket') {
      setIsWarning(true)
      setBridgeName('Socket Network')
    }

    if (activeBridge?.includes('arbitrum')) {
      setIsWarning(false)
      setBridgeName('Arbitrum One Bridge')
    }
  }, [activeBridge, status, symbol, t, typedValue])

  const onDismiss = () => {
    handleResetBridge()

    if ((['disclaimer', 'error', 'success'] as BridgeModalType[]).includes(modalType)) {
      setStatus(BridgeModalStatus.CLOSED)
    }

    if (modalType === 'collecting') {
      setIsCollecting(false)
    }
  }

  return (
    <BridgeModalContent
      isOpen
      modalType={modalType}
      text={text}
      heading={heading}
      onDismiss={onDismiss}
      onConfirm={handleSubmit}
      error={error}
      disableConfirm={disableConfirm}
      setDisableConfirm={setDisableConfirm}
      bridgeName={bridgeName}
      isWarning={isWarning}
    />
  )
}
