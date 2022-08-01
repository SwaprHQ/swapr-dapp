import styled from 'styled-components'

import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import { LoadingCard } from './LoadingCard'

interface LoadingGridProps {
  itemsAmount?: number
}

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

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  ${({ theme }) => theme.mediaWidth.upToMedium`
    grid-template-columns: repeat(2, 1fr);
  `};
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    grid-template-columns: auto;
  `};
  grid-gap: 12px 10px;
`
