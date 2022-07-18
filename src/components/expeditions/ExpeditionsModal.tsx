import React from 'react'
import styled from 'styled-components'

import SwprLogo from '../../assets/images/swpr-logo.png'
import { useShowExpeditionsPopup } from '../../state/application/hooks'
import { TYPE } from '../../theme'
import { AutoColumn } from '../Column'
import Modal from '../Modal'
import Row from '../Row'
import { StyledExternalLink } from './TaskCard'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
`

const UpperAutoColumn = styled(AutoColumn)`
  padding: 32px;
`

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
            <TYPE.white fontSize="14px">
              Embark on a journey through space-time. In Swapr expeditions, you will traverse the lavender sea, making
              incredible discoveries along the way.
            </TYPE.white>
          </Row>
          <Row>
            <TYPE.white fontSize="14px">Get ready, Expeditions is launching very soon</TYPE.white>
          </Row>
          <Row>
            <StyledExternalLink href="https://twitter.com/swapreth">
              <i>Updates</i>
            </StyledExternalLink>
          </Row>
        </UpperAutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
