import { ReactNode } from 'react'
import styled from 'styled-components'

import SwprLogo from '../../../../assets/images/swpr-logo.png'
import { AutoColumn } from '../../../../components/Column'
import Modal from '../../../../components/Modal'
import Row from '../../../../components/Row'
import { useShowExpeditionsPopup } from '../../../../state/application/hooks'
import { TYPE } from '../../../../theme'
import { LiquidityProvisionTaskCard } from './partials/LiquidityProvisionTaskCard/LiquidityProvisionTaskCard'
import { LiquidityStakingTaskCard } from './partials/LiquidityStakingTaskCard'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
  padding: 32px;
  overflow-y: auto;
`

const Text = ({ children }: { children: ReactNode }) => (
  <TYPE.White fontSize="16px" lineHeight="150%">
    {children}
  </TYPE.White>
)

export interface ExpeditionsModalProps {
  onDismiss: () => void
}

export function ExpeditionsModal({ onDismiss }: ExpeditionsModalProps) {
  const open = useShowExpeditionsPopup()

  return (
    <Modal maxWidth={630} onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper gap="lg">
        <AutoColumn gap={'32px'}>
          <Row justifyContent={'center'} gap={'8px'}>
            <img src={SwprLogo} alt="SwprLogo" style={{ height: '40px' }} />
            <TYPE.LargeHeader>Swapr Expeditions</TYPE.LargeHeader>
          </Row>
          <Row>
            <Text>
              Expeditions are missions you can complete on Swapr to earn “Star Fragments”. These can be redeemed for
              special NFT's and various other rewards.
            </Text>
          </Row>
          <Row>
            <Text>Learn More</Text>
          </Row>
        </AutoColumn>
        <AutoColumn justify={'center'} gap="32px">
          <LiquidityProvisionTaskCard />
          <LiquidityStakingTaskCard />
        </AutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
