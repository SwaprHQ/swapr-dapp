import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useParsedQueryString() {
  const [search] = useSearchParams()
  return useMemo(() => Object.fromEntries(search), [search])
}
