import { darken } from 'polished'
import React from 'react'
import styled from 'styled-components'
import { Text } from 'rebass'

import Card from '../Card'
import { RowBetween } from '../Row'
import Column from '../Column'
import { AutoRow } from '../Row'

export const FixedHeightRow = styled(RowBetween)`
  height: 24px;
`

export const HoverCard = styled(Card)`
  border: 1px solid transparent;
  :hover {
    border: 1px solid ${({ theme }) => darken(0.06, theme.bg2)};
  }
`
const CardWrapper = styled(Column)`
  position: relative;
  align-items: center;
  justify-content: center;
  background: rgba(20, 19, 29, 0.75);
  border-radius: 4px;
  min-height: 96px;
  overflow: hidden;
  cursor: pointer;
  z-index: 10;
`

const TokenIconSM = styled.img`
  width: 26.88px;
  height: 26.88px;
`

interface GovernancePairCardProps {
  image: any
  pairCount: number
  proposalCount: number
  description: string
  onClick: () => void
}

export function GovernancePairCard({ image, pairCount, proposalCount, description, onClick }: GovernancePairCardProps) {
  const getSubTitle = () => {
    if (proposalCount > 0 && pairCount <= 0) return `${proposalCount} PROPOSALS`
    if (pairCount > 0 && proposalCount <= 0) return `${pairCount} PAIRS`
    if (pairCount <= 0 && proposalCount <= 0) return null
    return `${pairCount} PAIRS | ${proposalCount} PROPOSALS`
  }

  return (
    <CardWrapper onClick={onClick}>
      <AutoRow justify="center">
        <TokenIconSM src={image} style={{ marginRight: -10 }} />
        <TokenIconSM src={image} />
      </AutoRow>
      {getSubTitle() && (
        <Text fontSize={16} fontWeight={600} lineHeight="20px" style={{ marginTop: 8 }}>
          {description}/ETH
        </Text>
      )}
    </CardWrapper>
  )
}
