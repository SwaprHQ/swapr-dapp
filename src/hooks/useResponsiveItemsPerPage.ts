import { useMemo } from 'react'

import { MEDIA_WIDTHS } from '../theme'
import { useWindowSize } from './useWindowSize'

const { upToMedium } = MEDIA_WIDTHS

export function useResponsiveItemsPerPage(): number {
  const { width } = useWindowSize()

  return useMemo(() => {
    if (!width) return 0
    if (width <= upToMedium) return 6
    return 8
  }, [width])
}
