import { useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { useProfileRefreshOwnedAccents } from './Profile.hooks'
import { profileActions } from './Profile.reducer'

export const ProfileUpdater = () => {
  const dispatch = useDispatch()
  const { account } = useActiveWeb3React()
  const refreshAccents = useProfileRefreshOwnedAccents()

  useEffect(() => {
    if (account) {
      refreshAccents()
    } else {
      dispatch(profileActions.ownedAccentsUpdated({ ownedAccents: {} }))
    }
  }, [account, dispatch, refreshAccents])

  return null
}
