import { useEffect, useState } from 'react'

export const useWindowIsVisible = () => {
  const [windowIsVisible, setWindowIsVisible] = useState(true)
  const onVisibilityChange = () => setWindowIsVisible(!document.hidden)

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange, false)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return windowIsVisible
}
