import React, { useState, useEffect } from 'react'
import { BridgeModalContent } from './BridgeModalContent'
import { BridgeModalState, BridgeModalStatus } from '../../../services/EcoBridge/EcoBridge.types'
import { getNetworkInfo } from '../../../utils/networksList'
import { BridgeModalType } from './BridgeModal.types'

export interface BridgeModalProps {
  handleResetBridge: () => void
  setCollecting: (collecting: boolean) => void
  setStatus: (status: BridgeModalStatus, error?: string) => void
  modalData: BridgeModalState
  handleSubmit: () => void
}

export const BridgeModal = ({
  handleResetBridge,
  setCollecting,
  setStatus,
  modalData,
  handleSubmit
}: BridgeModalProps) => {
  const [heading, setHeading] = useState('')
  const [disableConfirm, setDisableConfirm] = useState(false)
  const [modalType, setModalType] = useState<BridgeModalType | null>(null)

  const { status, symbol, typedValue, fromChainId, toChainId, error, disclaimerText } = modalData

  const { name: fromNetworkName } = getNetworkInfo(fromChainId)
  const { name: toNetworkName } = getNetworkInfo(toChainId)

  const text = `${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`

  useEffect(() => {
    setDisableConfirm(false)
    switch (status) {
      case BridgeModalStatus.INITIATED:
        setModalType('initiated')
        setHeading('Bridging initiated')
        break
      case BridgeModalStatus.PENDING:
        setModalType('pending')
        break
      case BridgeModalStatus.COLLECTING:
        setModalType('collecting')
        setHeading('Collecting Initiated')
        break
      case BridgeModalStatus.SUCCESS:
        setModalType('success')
        setHeading('Bridging Successful')
        break
      case BridgeModalStatus.ERROR:
        setModalType('error')
        break
      case BridgeModalStatus.DISCLAIMER:
        setHeading(`Bridging ${typedValue} ${symbol ?? ''}`)
        setModalType('disclaimer')
        break

      default:
        setModalType(null)
    }
  }, [status, symbol, typedValue])

  const onDismiss = () => {
    handleResetBridge()

    if ((['disclaimer', 'error', 'success'] as BridgeModalType[]).includes(modalType)) {
      setStatus(BridgeModalStatus.CLOSED)
    }

    if (modalType === 'collecting') {
      setCollecting(false)
    }
  }

  return (
    <BridgeModalContent
      isOpen
      modalType={modalType}
      text={text}
      heading={heading}
      disclaimerText={disclaimerText}
      onDismiss={onDismiss}
      onConfirm={handleSubmit}
      error={error}
      disableConfirm={disableConfirm}
      setDisableConfirm={setDisableConfirm}
    />
  )
}
