import { Navigate, useParams, useSearchParams } from 'react-router-dom'

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function BaseRedirect({ pathname = '/swap' }) {
  const [search] = useSearchParams()
  const { outputCurrency } = useParams<{ outputCurrency: string }>()

  if (outputCurrency) {
    search.append('outputCurrency', outputCurrency)
  }
  return <Navigate to={{ pathname, search: search.toString() }} replace />
}
