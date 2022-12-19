import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppState } from '../../state'
import { useExpeditionsFetchRewards } from '../expeditions/Expeditions.hooks'
import { SUPPORTED_ACCENTS } from './accents/accents'
import { profileActions, ProfileState } from './Profile.reducer'

export const useProfile = () => {
  const profileState = useSelector((state: AppState) => state.profile)

  return profileState
}

export const useActiveAccent = () => {
  const activeAccent = useSelector((state: AppState) => state.profile.activeAccent)
  const ownedAccents = useSelector((state: AppState) => state.profile.ownedAccents)

  if (activeAccent) {
    return ownedAccents?.[activeAccent]
  }
}

export const useProfileRefreshOwnedAccents = () => {
  const fetchRewards = useExpeditionsFetchRewards()
  const dispatch = useDispatch()

  const refreshOwnedAccents = useCallback(async () => {
    try {
      dispatch(profileActions.statusUpdated({ status: 'pending' }))
      const ownedRewards = await fetchRewards()

      const ownedAccents = ownedRewards.reduce<ProfileState['ownedAccents']>((accents, hasReward, index) => {
        const accentTokenId = (index + 1).toString()
        if (accentTokenId in SUPPORTED_ACCENTS && hasReward) {
          accents[accentTokenId] = SUPPORTED_ACCENTS[accentTokenId]
        }
        return accents
      }, {})

      dispatch(profileActions.ownedAccentsUpdated({ ownedAccents }))
      dispatch(profileActions.statusUpdated({ status: 'success' }))
    } catch (error) {
      console.error(error)
      dispatch(profileActions.statusUpdated({ status: 'error', error: 'Fetching rewards failed' }))
    }
  }, [dispatch, fetchRewards])

  return refreshOwnedAccents
}
