import { useState } from 'react'

import { ReactComponent as SwaprLogo } from '../../../../assets/images/swapr-logo.svg'
import { AutoColumn } from '../../../../components/Column'
import { FallbackLoader } from '../../../../components/Loader/FallbackLoader'
import Modal from '../../../../components/Modal'
import Row from '../../../../components/Row'
import { useShowExpeditionsPopup } from '../../../../state/application/hooks'
import { CloseIcon, TYPE } from '../../../../theme'
import { ExpeditionsFragmentsBalance } from '../../components/ExpeditionsFragments'
import { ExpeditionsTabBar, ExpeditionsTabs } from '../../components/ExpeditionsTabBar'
import { useExpeditions } from '../../contexts/ExpeditionsContext'
import { ScrollableAutoColumn, StyledExternalLink } from '../shared'
import { ContentWrapper, ExpeditionsLogo } from './ExpeditionsModal.styled'
import { ExpeditionsRewards } from './ExpeditionsRewards'
import { ExpeditionsTasks } from './ExpeditionsTasks'
export interface ExpeditionsModalProps {
  onDismiss: () => void
}

export function ExpeditionsModal({ onDismiss }: ExpeditionsModalProps) {
  const open = useShowExpeditionsPopup()
  const [activeTab, setActiveTab] = useState(ExpeditionsTabs.TASKS)
  const { claimedFragments, error, isLoading } = useExpeditions()

  return (
    <Modal maxWidth={630} onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper gap="lg">
        {isLoading ? (
          <FallbackLoader />
        ) : (
          <>
            <AutoColumn gap={'32px'}>
              <Row>
                <CloseIcon style={{ visibility: 'hidden' }} />
                <Row justifyContent={'center'} gap={'16px'}>
                  <SwaprLogo />
                  <ExpeditionsLogo>&#10024;&nbsp;Expeditions</ExpeditionsLogo>
                </Row>
                <CloseIcon onClick={onDismiss} />
              </Row>
              <Row>
                <TYPE.White fontSize="12px" lineHeight="150%" textAlign={'center'}>
                  Expeditions are missions you can complete on Swapr to earn “Star Fragments”. These can be redeemed for
                  special NFT's and various other rewards. <StyledExternalLink href="#">Learn More</StyledExternalLink>
                </TYPE.White>
              </Row>
              {error ? (
                <TYPE.White fontSize="24px" lineHeight="150%" textAlign={'center'}>
                  No active expeditions campaign has been found
                </TYPE.White>
              ) : (
                <>
                  <Row justifyContent={'center'}>
                    <ExpeditionsTabBar activeTab={activeTab} setActiveTab={setActiveTab} claimableRewards={0} />
                  </Row>
                  <ExpeditionsFragmentsBalance balance={claimedFragments} />
                </>
              )}
            </AutoColumn>
            {!error && (
              <ScrollableAutoColumn>
                {activeTab === ExpeditionsTabs.TASKS ? <ExpeditionsTasks /> : <ExpeditionsRewards />}
              </ScrollableAutoColumn>
            )}
          </>
        )}
      </ContentWrapper>
    </Modal>
  )
}
