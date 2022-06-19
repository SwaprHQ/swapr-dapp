import queryString from 'query-string'
import { useCallback, useMemo } from 'react'
import { NavigateOptions, To, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

export function useRouter() {
  const params = useParams()
  const location = useLocation()
  const [search] = useSearchParams()
  const _navigate = useNavigate()

  const navigate = useCallback(
    (to: To, props?: NavigateOptions) => {
      if (typeof to === 'string') {
        _navigate({ pathname: to, search: search.toString() }, props)
      } else if (typeof to === 'object') {
        _navigate({ ...to, search: search.toString() }, props)
      }
    },
    [_navigate, search]
  )

  return useMemo(() => {
    return {
      navigate,
      pathname: location.pathname,
      query: {
        ...queryString.parse(location.search),
        ...params,
      },
      location,
      history,
    }
  }, [params, location, navigate])
}
