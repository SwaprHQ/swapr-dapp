import React from 'react'
import { BridgeErrorModal } from './BridgeErrorModal'
import { BridgePendingModal } from './BridgePendingModal'
import { BridgeSuccessModal } from './BridgeSuccesModal'
import { BridgingInitiatedModal } from './BridgingInitiatedModal'
import { BridgeDisclaimerModal } from './BridgeDisclaimerModal'
import { getNetworkInfo } from '../../../utils/networksList'
import { BridgeModalState, BridgeModalStatus } from '../../../services/Omnibridge/Omnibridge.types'

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
  const { status, symbol, typedValue, fromChainId, toChainId, error, disclaimerText } = modalData
  const { name: fromNetworkName } = getNetworkInfo(fromChainId)
  const { name: toNetworkName } = getNetworkInfo(toChainId)

  const txType = 'Bridging'

  const selectModal = () => {
    switch (status) {
      case BridgeModalStatus.INITIATED:
        return (
          <BridgingInitiatedModal
            isOpen
            onDismiss={() => {
              handleResetBridge()
              setStatus(BridgeModalStatus.CLOSED)
            }}
            heading={'Bridging Initiated'}
            text={`${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`}
          />
        )
      case BridgeModalStatus.PENDING:
        return (
          <BridgePendingModal
            isOpen
            onDismiss={() => setStatus(BridgeModalStatus.CLOSED)}
            text={`${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`}
          />
        )
      case BridgeModalStatus.COLLECTING:
        return (
          <BridgingInitiatedModal
            isOpen
            onDismiss={() => {
              setStatus(BridgeModalStatus.CLOSED)
              setCollecting(false)
            }}
            heading={'Collecting Initiated'}
            text={`${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`}
          />
        )
      case BridgeModalStatus.SUCCESS:
        return (
          <BridgeSuccessModal
            isOpen
            heading={'Bridging Successful'}
            text={`${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`}
            onDismiss={() => {
              handleResetBridge()
            }}
            onTradeButtonClick={handleResetBridge}
            onBackButtonClick={handleResetBridge}
          />
        )
      case BridgeModalStatus.ERROR:
        return (
          <BridgeErrorModal
            isOpen
            onDismiss={() => {
              handleResetBridge()
            }}
            error={error ?? ''}
          />
        )
      case BridgeModalStatus.DISCLAIMER:
        return (
          <BridgeDisclaimerModal
            isOpen
            onConfirm={handleSubmit}
            onDismiss={handleResetBridge}
            heading={`${txType} ${typedValue} ${symbol ?? ''}`}
            text={`${typedValue} ${symbol ?? ''} from ${fromNetworkName} to ${toNetworkName}`}
            disclaimerText={disclaimerText ? disclaimerText : ''}
          />
        )
      default:
        return null
    }
  }
  return selectModal()
}
