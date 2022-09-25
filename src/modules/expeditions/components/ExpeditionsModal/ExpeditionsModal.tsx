import { ReactNode, useState } from 'react'
import styled from 'styled-components'

import { ReactComponent as SwaprLogo } from '../../../../assets/images/swapr-logo.svg'
import { AutoColumn } from '../../../../components/Column'
import { HeaderButton } from '../../../../components/Header/HeaderButton'
import Modal from '../../../../components/Modal'
import Row from '../../../../components/Row'
import { useShowExpeditionsPopup } from '../../../../state/application/hooks'
import { CloseIcon, TYPE } from '../../../../theme'
import { ExpeditionsFragmentsBalance } from '../../components/ExpeditionsFragments'
import { ExpeditionsTabBar, ExpeditionsTabs } from '../../components/ExpeditionsTabBar'
import { ExpeditionsRewards } from './ExpeditionsRewards'
import { ExpeditionsTasks } from './ExpeditionsTasks'

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  background-color: ${({ theme }) => theme.dark1};
  padding: 32px;
  overflow-y: hidden;
`

const Text = ({ children }: { children: ReactNode }) => (
  <TYPE.White fontSize="12px" lineHeight="150%">
    {children}
  </TYPE.White>
)

export interface ExpeditionsModalProps {
  onDismiss: () => void
}

export function ExpeditionsModal({ onDismiss }: ExpeditionsModalProps) {
  const open = useShowExpeditionsPopup()
  const [activeTab, setActiveTab] = useState(ExpeditionsTabs.TASKS)

  return (
    <Modal maxWidth={630} onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper gap="lg">
        <AutoColumn gap={'32px'}>
          <Row>
            <CloseIcon style={{ visibility: 'hidden' }} />
            <Row justifyContent={'center'} gap={'16px'}>
              <SwaprLogo />
              <HeaderButton glow>&#10024;&nbsp;Expeditions</HeaderButton>
            </Row>
            <CloseIcon onClick={onDismiss} />
          </Row>
          <Row>
            <Text>
              Expeditions are missions you can complete on Swapr to earn “Star Fragments”. These can be redeemed for
              special NFT's and various other rewards. Learn More
            </Text>
          </Row>
          <Row justifyContent={'center'}>
            <ExpeditionsTabBar activeTab={activeTab} setActiveTab={setActiveTab} claimableRewards={0} />
          </Row>
          <ExpeditionsFragmentsBalance balance={9999} />
        </AutoColumn>
        <AutoColumn justify={'center'} gap="32px" style={{ overflowY: 'scroll' }}>
          {activeTab === ExpeditionsTabs.TASKS ? <ExpeditionsTasks /> : <ExpeditionsRewards />}
        </AutoColumn>
      </ContentWrapper>
    </Modal>
  )
}
