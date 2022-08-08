import { AlertCircle, ArrowRightCircle } from 'react-feather'
import { Trans, useTranslation } from 'react-i18next'

import { ButtonPrimary } from '../../../components/Button'
import Modal from '../../../components/Modal'
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
  const { t } = useTranslation('bridge')
  return (
    <>
      {modalType && (
        <Modal isOpen={isOpen} onDismiss={onDismiss}>
          {modalType === 'pending' && <ConfirmationPendingContent onDismiss={onDismiss} pendingText={text ?? ''} />}

          {modalType === 'error' && <TransactionErrorContent onDismiss={onDismiss} message={error ?? ''} />}

          {modalType !== 'pending' && modalType !== 'error' && (
            <Wrapper data-testid="bridge-initiated-modal">
              {isWarning ? (
                <AlertCircle strokeWidth={0.5} size={75} color="#EBE9F8" />
              ) : (
                <ArrowRightCircle strokeWidth={0.5} size={75} color="#EBE9F8" />
              )}
              <TitleWrapper>
                <TYPE.Body fontSize="22px" fontWeight="500" color="text1" textAlign="center">
                  {heading}
                </TYPE.Body>
              </TitleWrapper>
              {modalType === 'disclaimer' && (
                <>
                  <TYPE.Main fontSize="14px" fontWeight="500" color="#EBE9F8" textAlign="center" lineHeight="1.6">
                    {text}
                  </TYPE.Main>
                  <DisclaimerTextWrapper isWarning={isWarning}>
                    <DisclaimerText>
                      <Trans
                        i18nKey="bridge:bridge.txnThrough"
                        values={{ bridgeName }}
                        components={[<span key="0"></span>]}
                      />
                    </DisclaimerText>
                    {isWarning && <DisclaimerText>{t('bridge.walletControl', { bridgeName })}</DisclaimerText>}
                    <DisclaimerText>
                      <Trans i18nKey="bridge:bridge.responsible" components={[<span key="0"></span>]} />
                    </DisclaimerText>
                  </DisclaimerTextWrapper>
                  <ButtonAccept
                    data-testid="accept-bridging"
                    mb="12px"
                    disabled={disableConfirm}
                    onClick={() => {
                      setDisableConfirm(true)
                      onConfirm()
                    }}
                    isWarning={isWarning}
                  >
                    {t('bridge.confirmText')}
                  </ButtonAccept>
                  <ButtonCancel onClick={onDismiss}>{t('bridge.rejectText')}</ButtonCancel>
                </>
              )}
              {modalType === 'success' && (
                <>
                  <TYPE.Main>{text}</TYPE.Main>{' '}
                  <ButtonsWrapper>
                    <ButtonPrimary data-testid="close-bridge-initiated-button" onClick={onDismiss}>
                      {t('bridge.backText')}
                    </ButtonPrimary>
                  </ButtonsWrapper>
                </>
              )}
              {(modalType === 'initiated' || modalType === 'collecting') && (
                <>
                  <TYPE.Main textAlign="center" mb="24px">
                    {text}
                  </TYPE.Main>
                  <ButtonPrimary data-testid="close-bridge-initiated-button" onClick={onDismiss}>
                    {t('bridge.backText')}
                  </ButtonPrimary>
                </>
              )}
            </Wrapper>
          )}
        </Modal>
      )}
    </>
  )
}
