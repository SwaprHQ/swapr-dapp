import React from 'react'
import { ArrowRightCircle, AlertCircle } from 'react-feather'
import Modal from '../../../components/Modal'
import { ButtonPrimary } from '../../../components/Button'
import { ConfirmationPendingContent, TransactionErrorContent } from '../../../components/TransactionConfirmationModal'
import { TYPE } from '../../../theme'
import {
  ButtonAccept,
  ButtonCancel,
  ButtonsWrapper,
  DisclaimerText,
  DisclaimerTextWrapper,
  TitleWrapper,
  Wrapper,
} from './BridgeModal.styles'
import { BridgeModalContentProps } from './BridgeModal.types'
import { Trans, useTranslation } from 'react-i18next'

export const BridgeModalContent = ({
  isOpen,
  onDismiss,
  modalType,
  text,
  error,
  heading,
  onConfirm,
  disableConfirm,
  setDisableConfirm,
  isWarning,
  bridgeName,
}: BridgeModalContentProps) => {
  const { t } = useTranslation()
  return (
    <>
      {modalType && (
        <Modal isOpen={isOpen} onDismiss={onDismiss}>
          {modalType === 'pending' && <ConfirmationPendingContent onDismiss={onDismiss} pendingText={text ?? ''} />}

          {modalType === 'error' && <TransactionErrorContent onDismiss={onDismiss} message={error ?? ''} />}

          {modalType !== 'pending' && modalType !== 'error' && (
            <Wrapper>
              {isWarning ? (
                <AlertCircle strokeWidth={0.5} size={75} color="#EBE9F8" />
              ) : (
                <ArrowRightCircle strokeWidth={0.5} size={75} color="#EBE9F8" />
              )}
              <TitleWrapper>
                <TYPE.body fontSize="22px" fontWeight="500" color="text1" textAlign="center">
                  {heading}
                </TYPE.body>
              </TitleWrapper>
              {modalType === 'disclaimer' && (
                <>
                  <TYPE.main fontSize="14px" fontWeight="500" color="#EBE9F8" textAlign="center" lineHeight="1.6">
                    {text}
                  </TYPE.main>
                  <DisclaimerTextWrapper isWarning={isWarning}>
                    <DisclaimerText>
                      <Trans i18nKey="bridgeTxnThrough" values={{ bridgeName }} components={[<span key="0"></span>]} />
                    </DisclaimerText>
                    {isWarning && <DisclaimerText>{t('bridgeWalletControl', { bridgeName })}</DisclaimerText>}
                    <DisclaimerText>
                      <Trans i18nKey="bridgeResponsible" components={[<span key="0"></span>]} />
                    </DisclaimerText>
                  </DisclaimerTextWrapper>
                  <ButtonAccept
                    mb="12px"
                    disabled={disableConfirm}
                    onClick={() => {
                      setDisableConfirm(true)
                      onConfirm()
                    }}
                    isWarning={isWarning}
                  >
                    {t('bridgeConfirmText')}
                  </ButtonAccept>
                  <ButtonCancel onClick={onDismiss}>{t('bridgeRejectText')}</ButtonCancel>
                </>
              )}
              {modalType === 'success' && (
                <>
                  <TYPE.main>{text}</TYPE.main>{' '}
                  <ButtonsWrapper>
                    <ButtonPrimary onClick={onDismiss}>{t('bridgeBackText')}</ButtonPrimary>
                  </ButtonsWrapper>
                </>
              )}
              {(modalType === 'initiated' || modalType === 'collecting') && (
                <>
                  <TYPE.main textAlign="center" mb="24px">
                    {text}
                  </TYPE.main>
                  <ButtonPrimary onClick={onDismiss}>{t('bridgeBackText')}</ButtonPrimary>
                </>
              )}
            </Wrapper>
          )}
        </Modal>
      )}
    </>
  )
}
