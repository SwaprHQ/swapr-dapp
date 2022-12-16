import { useEffect, useState } from 'react'

import { FallbackLoader } from '../../../../components/Loader/FallbackLoader'
import { AbsoluteWrapper } from './Chart.styles'

const THREE_SECONDS = 3000

export function ChartLoader({ pairAddress }: { pairAddress?: string }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), THREE_SECONDS)
    return () => clearTimeout(timeout)
  }, [pairAddress])

  return pairAddress && isLoading ? (
    <AbsoluteWrapper>
      <FallbackLoader />
    </AbsoluteWrapper>
  ) : null
}
