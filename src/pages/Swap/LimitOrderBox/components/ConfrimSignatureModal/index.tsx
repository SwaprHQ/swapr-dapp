import { Currency } from '@swapr/sdk'

import { useCallback } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../../../../components/TransactionConfirmationModal'
import { ConfirmationFooter, FooterData } from './ConfirmationFooter'
import { ConfirmationHeader, HeaderData } from './ConfirmationHeader'

export default function ConfirmSignatureModal({
  footerContent,
  headerContent,
  onConfirm,
  onDismiss,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
}: {
  isOpen: boolean
  footerContent: FooterData | undefined
  headerContent: HeaderData | undefined
  attemptingTxn: boolean
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: string | undefined
  onDismiss: () => void
}) {
  const modalHeader = useCallback(() => {
    return headerContent ? <ConfirmationHeader data={headerContent} /> : null
  }, [headerContent])

  const modalBottom = useCallback(() => {
    return footerContent ? <ConfirmationFooter onConfirm={onConfirm} data={footerContent} /> : null
  }, [footerContent, onConfirm])

  // text to show while loading
  const pendingText = 'Some text while loading'

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm Swap"
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}
