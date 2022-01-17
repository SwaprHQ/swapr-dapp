import React from 'react'
import styled from 'styled-components'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import LoadingCard from './LoadingCard'

const ListLayout = styled.div<{ isMobile: boolean }>`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: auto;
  ${props =>
    props.isMobile &&
    `
    grid-template-columns: 1fr 1fr 1fr;
  `};
`

interface LoadingListProps {
  itemsAmount?: number
  isMobile?: boolean
}

export default function LoadingList({ itemsAmount, isMobile = false }: LoadingListProps) {
  const responsiveItemsAmount = useResponsiveItemsPerPage()

  return (
    <ListLayout isMobile={isMobile}>
      {new Array(itemsAmount && itemsAmount !== 0 ? itemsAmount : responsiveItemsAmount).fill(null).map((_, index) => (
        <LoadingCard isMobile={isMobile} key={index} />
      ))}
    </ListLayout>
  )
}
