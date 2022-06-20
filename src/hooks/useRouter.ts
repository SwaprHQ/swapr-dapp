import { useCallback, useMemo } from 'react'
import { NavigateOptions, To, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

export function useRouter() {
  const params = useParams()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const _navigate = useNavigate()

  const navigate = useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'string') {
        return _navigate({ pathname: to, search: searchParams.toString() }, options)
      } else if (typeof to === 'object') {
        return _navigate({ ...to, search: searchParams.toString() }, options)
      } else if (typeof to === 'number') {
        return _navigate(to)
      }
      throw new Error('Invalid "to" value in navigate')
    },
    [_navigate, searchParams]
  )

  return useMemo(() => {
    return {
      navigate,
      searchParams,
      setSearchParams,
      pathname: location.pathname,
      query: {
        ...Object.fromEntries(searchParams),
        ...params,
      },
      location,
    }
  }, [navigate, searchParams, setSearchParams, location, params])
}
