import { TokenAmount } from '@swapr/sdk'

import { transparentize } from 'polished'
import { useCallback } from 'react'
import { Flex } from 'rebass'
import styled from 'styled-components'

import { useRouter } from '../../hooks/useRouter'
import { useShowClaimPopup } from '../../state/application/hooks'
import { CloseIcon, TYPE } from '../../theme'
import { AddTokenButton } from '../AddTokenButton/AddTokenButton'
import { ButtonDark1, ButtonPurple } from '../Button'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import { RowBetween } from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg1};
`

const UpperAutoColumn = styled(AutoColumn)`
  padding: 24px;
  background-color: ${({ theme }) => transparentize(0.45, theme.bg2)};
  backdrop-filter: blur(12px);
`

export default function ClaimModal({
  onDismiss,
  newSwprBalance,
  stakedAmount,
  singleSidedCampaignLink,
}: {
  onDismiss: () => void
  newSwprBalance?: TokenAmount
  stakedAmount?: string | null
  singleSidedCampaignLink?: string
}) {
  const { navigate } = useRouter()
  const open = useShowClaimPopup()

  const wrappedOnDismiss = useCallback(() => {
    onDismiss()
  }, [onDismiss])

  const handleStakeUnstakeClick = () => {
    if (singleSidedCampaignLink) {
      navigate('/rewards', { state: { showSwpr: true } })
      wrappedOnDismiss()
    }
  }

  return (
    <Modal onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper gap="lg">
        <UpperAutoColumn gap="26px">
          <RowBetween>
            <TYPE.White fontWeight={500} fontSize="20px" lineHeight="24px" color="text4">
              Your SWPR details
            </TYPE.White>
            <CloseIcon onClick={wrappedOnDismiss} style={{ zIndex: 99 }} />
          </RowBetween>
          <RowBetween>
            <Flex width="50%" flexDirection="column">
              <TYPE.White fontWeight={700} fontSize={26}>
                {newSwprBalance?.toFixed(3) || '0.000'}
              </TYPE.White>
              <TYPE.Body marginTop="4px" marginBottom="11px" fontWeight="600" fontSize="11px">
                SWPR
              </TYPE.Body>
              <ButtonPurple onClick={handleStakeUnstakeClick}>STAKE</ButtonPurple>
            </Flex>

            <Flex width="50%" flexDirection="column">
              <TYPE.White fontWeight={700} fontSize={26}>
                {stakedAmount ? parseFloat(stakedAmount).toFixed(3) : '0.000'}
              </TYPE.White>
              <TYPE.Body marginTop="4px" marginBottom="11px" fontWeight="600" fontSize="11px">
                STAKED SWPR
              </TYPE.Body>
              <ButtonDark1 onClick={handleStakeUnstakeClick}>UNSTAKE</ButtonDark1>
            </Flex>
          </RowBetween>
        </UpperAutoColumn>
        <AutoColumn gap="md" style={{ padding: '1rem', paddingTop: '0' }} justify="center">
          <AddTokenButton active={newSwprBalance?.greaterThan('0')} />
        </AutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
