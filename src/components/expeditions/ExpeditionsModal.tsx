import React, { FC, PropsWithChildren } from 'react'
import styled from 'styled-components'

import SwprLogo from '../../assets/images/swpr-logo.png'
import { useShowExpeditionsPopup } from '../../state/application/hooks'
import { ExternalLink, TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import Row from '../Row'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
`

const UpperAutoColumn = styled(AutoColumn)`
  padding: 32px;
`

const Text: FC<PropsWithChildren> = ({ children }) => (
  <TYPE.white fontSize="16px" lineHeight="150%">
    {children}
  </TYPE.white>
)

export default function ExpeditionsModal({ onDismiss }: { onDismiss: () => void }) {
  const open = useShowExpeditionsPopup()

  return (
    <Modal maxWidth={630} onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper gap="lg">
        <UpperAutoColumn gap={'32px'}>
          <Row justifyContent={'center'} gap={'8px'}>
            <img src={SwprLogo} alt="SwprLogo" style={{ height: '40px' }} />
            <TYPE.largeHeader>Swapr Expeditions</TYPE.largeHeader>
          </Row>
          <Row>
            <Text>
              Embark on a journey through space-time. In Swapr expeditions, you will traverse the lavender sea, making
              incredible discoveries along the way.
            </Text>
          </Row>
          <Row>
            <Text>Get ready, Expeditions is launching very soon.</Text>
          </Row>
          <Row>
            <Text>
              Follow Swapr <ExternalLink href="https://twitter.com/swapreth">Twitter</ExternalLink> or{' '}
              <ExternalLink href="https://discord.gg/4QXEJQkvHH">Discord</ExternalLink> to get updates on Expeditions.
            </Text>
          </Row>
        </UpperAutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
