import React from 'react'

import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { LoadingCard } from './LoadingCard'
import { GridLayout } from './LoadingGrid.styles'
import { LoadingGridProps } from './LoadingGrid.types'

export function LoadingGrid({ itemsAmount }: LoadingGridProps) {
  const responsiveItemsAmount = useResponsiveItemsPerPage()

  return (
    <GridLayout>
      {new Array(itemsAmount && itemsAmount !== 0 ? itemsAmount : responsiveItemsAmount).fill(null).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </GridLayout>
  )
}
