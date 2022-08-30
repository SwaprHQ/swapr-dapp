import { Navigate, useParams, useSearchParams } from 'react-router-dom'

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function RedirectToSwap() {
  const [search] = useSearchParams()
  const { outputCurrency } = useParams<{ outputCurrency: string }>()

  if (outputCurrency) {
    search.append('outputCurrency', outputCurrency)
  }
  return <Navigate to={{ pathname: '/swap', search: search.toString() }} replace />
}
