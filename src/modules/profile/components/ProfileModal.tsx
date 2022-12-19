// import { useState } from 'react'
import { useCallback, useMemo } from 'react'
import { useDispatch } from 'react-redux'

import { AutoColumn } from '../../../components/Column'
import { FallbackLoader } from '../../../components/Loader/FallbackLoader'
import Modal from '../../../components/Modal'
import Row, { RowBetween } from '../../../components/Row'
import { CloseIconStyled, ContentWrapper } from '../../../components/SearchModal/CurrencySearch/CurrencySearch.styles'
import { Separator } from '../../../components/SearchModal/shared'
import { useShowProfilePopup } from '../../../state/application/hooks'
import { TYPE } from '../../../theme'
import { ScrollableAutoColumn } from '../../expeditions/components/shared'
import { useProfile } from '../Profile.hooks'
import { profileActions } from '../Profile.reducer'
import { ProfileItem } from './ProfileItem'

export interface ProfileModalProps {
  onDismiss: () => void
}

export function ProfileModal({ onDismiss }: ProfileModalProps) {
  const open = useShowProfilePopup()
  const { ownedAccents, status, activeAccent, error } = useProfile()
  const dispatch = useDispatch()
  const setActiveAccent = useCallback(
    (tokenId: string) => dispatch(profileActions.activeAccentUpdated({ activeAccent: tokenId })),
    [dispatch]
  )

  const mappedAccents = useMemo(() => Object.values(ownedAccents).map(accent => accent), [ownedAccents])

  return (
    <Modal maxHeight={60} minHeight={60} onDismiss={onDismiss} isOpen={open}>
      <ContentWrapper>
        {status === 'pending' || status === 'idle' ? (
          <FallbackLoader />
        ) : status === 'error' ? (
          <>{error}</>
        ) : (
          <>
            <AutoColumn style={{ padding: '22px 18.5px 20px 18.5px' }} gap="15px">
              <RowBetween>
                <TYPE.Body fontWeight={500}>Profile</TYPE.Body>
                <CloseIconStyled data-testid="close-icon" onClick={onDismiss} />
              </RowBetween>
            </AutoColumn>
            <Separator />
            <Row flexDirection="column" style={{ padding: '22px 18.5px 20px 18.5px' }} gap="15px" overflow="hidden">
              <RowBetween>
                <TYPE.Body fontWeight={500}>Accents</TYPE.Body>
              </RowBetween>
              {mappedAccents.length > 0 ? (
                <ScrollableAutoColumn style={{ display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
                  {mappedAccents.map(({ description, name, tokenId }) => (
                    <ProfileItem
                      tokenId={tokenId}
                      name={name}
                      description={description}
                      key={tokenId}
                      activeTokenId={activeAccent}
                      activate={setActiveAccent}
                    />
                  ))}
                </ScrollableAutoColumn>
              ) : (
                <Row alignItems={'center'} justifyContent="center">
                  <TYPE.Body fontWeight={500}>You don't own any accents yet</TYPE.Body>
                </Row>
              )}
            </Row>
          </>
        )}
      </ContentWrapper>
    </Modal>
  )
}
