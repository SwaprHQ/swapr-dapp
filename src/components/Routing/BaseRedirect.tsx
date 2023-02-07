import { Navigate, useParams, useSearchParams } from 'react-router-dom'

import { useUpdateSelectedChartOption } from '../../state/user/hooks'
import { ChartOption } from '../../state/user/reducer'

// Redirects from the /swap/:outputCurrency path to the /swap?outputCurrency=:outputCurrency format
export function BaseRedirect({ pathname = '/swap' }) {
  const [search] = useSearchParams()
  const { outputCurrency } = useParams<{ outputCurrency: string }>()
  const [selectedChartTab] = useUpdateSelectedChartOption()

  if (selectedChartTab === ChartOption.PRO) {
    pathname = '/swap/pro'
  }

  if (outputCurrency) {
    search.append('outputCurrency', outputCurrency)
  }
  return <Navigate to={{ pathname, search: search.toString() }} replace />
}
