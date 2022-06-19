import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSearchParams } from 'react-router-dom'

import { updateUserDarkMode } from '../state/user/actions'
// TODO: This is not used for theme switching. Can be removed
export default function DarkModeQueryParamReader() {
  const dispatch = useDispatch()
  const [search] = useSearchParams()
  useEffect(() => {
    if (!search || !search.has('theme')) return

    const theme = search.get('theme') ?? 'dark'
    if (theme?.toLowerCase() === 'light') {
      dispatch(updateUserDarkMode({ userDarkMode: false }))
    } else {
      dispatch(updateUserDarkMode({ userDarkMode: true }))
    }
  }, [dispatch, search])

  return <></>
}
