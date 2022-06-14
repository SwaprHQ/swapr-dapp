import { Pair, Token, TokenAmount } from '@swapr/sdk'

import React, { useCallback } from 'react'

import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from '../../TransactionConfirmationModal'
import StakingRewardsDistributionCreationModalFooter from './StakingRewardsDistributionCreationModalFooter'

interface ConfirmStakingRewardsDistributionCreationProps {
  onConfirm: () => void
  onDismiss: () => void
  isOpen: boolean
  attemptingTransaction: boolean
  transactionHash: string | null
  errorMessage: string | null
  startTime: Date | null
  endTime: Date | null
  rewards: TokenAmount[] | null
  timelocked: boolean
  stakingCap: TokenAmount | null
  unlimitedPool: boolean
  stakeToken?: Token
  stakePair?: Pair
}

export default function ConfirmStakingRewardsDistributionCreation({
  onConfirm,
  onDismiss,
  isOpen,
  attemptingTransaction,
  transactionHash,
  errorMessage,
  stakeToken,
  stakePair,
  startTime,
  endTime,
  rewards,
  timelocked,
  stakingCap,
  unlimitedPool,
}: ConfirmStakingRewardsDistributionCreationProps) {
  const confirmationContent = useCallback(
    () =>
      errorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={errorMessage} />
      ) : (
        <ConfirmationModalContent
          title="Confirm creation"
          onDismiss={onDismiss}
          topContent={() => null}
          bottomContent={() => (
            <StakingRewardsDistributionCreationModalFooter
              onConfirm={onConfirm}
              stakeToken={stakeToken}
              stakePair={stakePair}
              startTime={startTime}
              endTime={endTime}
              rewards={rewards}
              timelocked={timelocked}
              stakingCap={stakingCap}
              unlimitedPool={unlimitedPool}
            />
          )}
        />
      ),
    [
      errorMessage,
      onDismiss,
      onConfirm,
      stakeToken,
      stakePair,
      startTime,
      endTime,
      rewards,
      timelocked,
      stakingCap,
      unlimitedPool,
    ]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTransaction}
      hash={transactionHash || undefined}
      content={confirmationContent}
      pendingText="Creating liquidity mining campaign"
    />
  )
}
