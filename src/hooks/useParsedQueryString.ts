import { parse, ParsedQs } from 'qs'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

// TODO: qs package can be removed and replaced with useSearchParams from react-router-dom
// Object.fromEntries(searchParams) gives the same result
export default function useParsedQueryString(): ParsedQs {
  const { search } = useLocation()
  return useMemo(
    () => (search && search.length > 1 ? parse(search, { parseArrays: false, ignoreQueryPrefix: true }) : {}),
    [search]
  )
}
