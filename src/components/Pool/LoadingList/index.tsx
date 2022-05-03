import React from 'react'
import { Text } from 'rebass'
import styled from 'styled-components'
import { useResponsiveItemsPerPage } from '../../../hooks/useResponsiveItemsPerPage'
import LoadingCard from './LoadingCard'

export const ListLayout = styled.div`
  display: grid;
  grid-template-columns: auto;
`

interface LoadingListProps {
  itemsAmount?: number
}

const Header = styled.div`
  display: grid;
  grid-template-columns: 3fr 3fr 2fr 2fr 1fr;
  padding: 12px 28px;
`

const HeaderText = styled(Text)`
  font-weight: 600;
  font-size: 10px;
  color: ${({ theme }) => theme.purple3};
  text-transform: uppercase;
`

export function LoadingList({ itemsAmount }: LoadingListProps) {
  const responsiveItemsAmount = useResponsiveItemsPerPage()

  return (
    <ListLayout>
      <Header>
        <HeaderText>Pair</HeaderText>
        <HeaderText>Campaigns</HeaderText>
        <HeaderText>TVL</HeaderText>
        <HeaderText>24h volume</HeaderText>
        <HeaderText>APY</HeaderText>
      </Header>
      {new Array(itemsAmount && itemsAmount !== 0 ? itemsAmount : responsiveItemsAmount).fill(null).map((_, index) => (
        <LoadingCard key={index} />
      ))}
    </ListLayout>
  )
}
