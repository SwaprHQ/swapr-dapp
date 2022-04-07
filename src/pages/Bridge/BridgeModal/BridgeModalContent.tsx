import React from 'react'
import { ArrowRightCircle } from 'react-feather'
import Modal from '../../../components/Modal'
import { ButtonPrimary, ButtonSecondary } from '../../../components/Button'
import { ConfirmationPendingContent, TransactionErrorContent } from '../../../components/TransactionConfirmationModal'
import { TYPE } from '../../../theme'
import { Button, ButtonsWrapper, TitleWrapper, Wrapper } from './BridgeModal.styles'
import { BridgeModalContentProps } from './BridgeModal.types'

export const BridgeModalContent = ({
  isOpen,
  onDismiss,
  modalType,
  text,
  error,
  heading,
  disclaimerText,
  onConfirm,
  disableConfirm,
  setDisableConfirm
}: BridgeModalContentProps) => {
  return (
    <>
      {modalType && (
        <Modal isOpen={isOpen} onDismiss={onDismiss}>
          {modalType === 'pending' && <ConfirmationPendingContent onDismiss={onDismiss} pendingText={text ?? ''} />}

          {modalType === 'error' && <TransactionErrorContent onDismiss={onDismiss} message={error ?? ''} />}

          {modalType !== 'pending' && modalType !== 'error' && (
            <Wrapper>
              <ArrowRightCircle strokeWidth={0.5} size={75} color="#0E9F6E" />
              <TitleWrapper>
                <TYPE.body fontSize="22px" fontWeight="500" color="text1" textAlign="center">
                  {heading}
                </TYPE.body>
              </TitleWrapper>
              {modalType === 'disclaimer' && (
                <>
                  <TYPE.main
                    mb="16px"
                    fontSize="16px"
                    fontWeight="600"
                    color="#EBE9F8"
                    textAlign="center"
                    lineHeight="1.6"
                  >
                    {text}
                  </TYPE.main>
                  <TYPE.small mb="24px" textAlign="center" fontSize="14px" lineHeight="1.6">
                    {disclaimerText}
                    Would you like to proceed?
                  </TYPE.small>
                  <ButtonPrimary
                    mb="12px"
                    disabled={disableConfirm}
                    onClick={() => {
                      setDisableConfirm(true)
                      onConfirm()
                    }}
                  >
                    CONFIRM
                  </ButtonPrimary>
                  <ButtonSecondary onClick={onDismiss}>CANCEL</ButtonSecondary>
                </>
              )}
              {modalType === 'success' && (
                <>
                  <TYPE.main>{text}</TYPE.main>{' '}
                  <ButtonsWrapper>
                    <Button onClick={onDismiss}>Back to bridge</Button>
                  </ButtonsWrapper>
                </>
              )}
              {(modalType === 'initiated' || modalType === 'collecting') && (
                <>
                  <TYPE.main mb="24px">{text}</TYPE.main>
                  <ButtonPrimary onClick={onDismiss}>Back to Bridge</ButtonPrimary>
                </>
              )}
            </Wrapper>
          )}
        </Modal>
      )}
    </>
  )
}
