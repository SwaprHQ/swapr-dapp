import { PricedTokenAmount, TokenAmount } from '@swapr/sdk'
import React, { useCallback, useState } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent
} from '../../../../TransactionConfirmationModal'
import ConfirmStakingModalFooter from '../ModalBase/Footer'
import ConfirmStakingWithdrawingModalHeader from '../ModalBase/Header'

interface ConfirmWithdrawalModalProps {
  stakablePair?: any
  isOpen: boolean
  withdrawablTokenBalance?: PricedTokenAmount
  attemptingTxn: boolean
  txHash: string
  onConfirm: (amount: TokenAmount) => void
  onDismiss: () => void
  errorMessage: string
  isSingleSide: boolean
}

export default function ConfirmWithdrawalModal({
  stakablePair,
  isOpen,
  attemptingTxn,
  txHash,
  errorMessage,
  isSingleSide,
  withdrawablTokenBalance,
  onDismiss,
  onConfirm
}: ConfirmWithdrawalModalProps) {
  const [withdrawableAmount, setWithdrawableAmount] = useState<TokenAmount | null>(null)
  const transactionModalText = isSingleSide
    ? `${stakablePair.symbol}`
    : `${stakablePair.token0.symbol}/${stakablePair.token1.symbol}`
  const handleWithdrawableAmountChange = useCallback(amount => {
    setWithdrawableAmount(amount)
  }, [])

  const handleConfirm = useCallback(() => {
    if (!withdrawableAmount) return
    onConfirm(withdrawableAmount)
  }, [onConfirm, withdrawableAmount])
  const topContent = useCallback(
    () => (
      <ConfirmStakingWithdrawingModalHeader
        maximumAmount={withdrawablTokenBalance}
        onAmountChange={handleWithdrawableAmountChange}
        stakablePair={stakablePair}
        isSingleSided={isSingleSide}
      />
    ),
    [handleWithdrawableAmountChange, withdrawablTokenBalance, isSingleSide, stakablePair]
  )

  const content = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm withdrawal"
          onDismiss={onDismiss}
          topContent={topContent}
          bottomContent={() => (
            <ConfirmStakingModalFooter
              disabledConfirm={
                !withdrawableAmount ||
                withdrawableAmount.equalTo('0') ||
                !withdrawablTokenBalance ||
                withdrawableAmount.greaterThan(withdrawablTokenBalance)
              }
              text={transactionModalText}
              showApprove={false}
              onConfirm={handleConfirm}
            />
          )}
        />
      ),
    [
      errorMessage,
      handleConfirm,
      onDismiss,
      topContent,
      withdrawablTokenBalance,
      withdrawableAmount,
      transactionModalText
    ]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={content}
      pendingText={`Withdrawing ${withdrawableAmount?.toSignificant(6)}`}
    />
  )
}
