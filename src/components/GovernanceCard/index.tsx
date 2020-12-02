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
  background: linear-gradient(180deg, rgba(39, 117, 202, 0) 16.49%, #2775ca 588.66%), rgba(20, 19, 29, 0.45);
  box-shadow: inset 0px 0.5px 3px rgba(255, 255, 255, 0.08), inset 0px 1px 1px rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(24px);
  border-radius: 4px;
  min-height: 96px;
  overflow: hidden;
  cursor: pointer;
  z-index: 10;
`

const TokenIconSM = styled.img`
  width: 20px;
  height: 20px;
`

const TokenIconBackground = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  z-index: -1;
  filter: blur(18px);
  opacity: 0.5;
`

interface GovernanceCardProps {
  image: any
  pairCount: number
  proposalCount: number
  description: string
}

export function GovernanceCard({ image, pairCount, proposalCount, description }: GovernanceCardProps) {
  const getSubTitle = () => {
    if (proposalCount > 0 && pairCount <= 0) return `${proposalCount} PROPOSALS`
    if (pairCount > 0 && proposalCount <= 0) return `${pairCount} PAIRS`
    if (pairCount <= 0 && proposalCount <= 0) return null
    return `${pairCount} PAIRS | ${proposalCount} PROPOSALS`
  }

  return (
    <CardWrapper>
      <TokenIconBackground src={image} />

      <AutoRow justify="center">
        <TokenIconSM src={image} style={{ marginRight: 6 }} />
        <Text fontSize={16} fontWeight={600} lineHeight="20px">
          {description}
        </Text>
      </AutoRow>
      {getSubTitle() && (
        <Text fontSize={9} fontWeight={600} lineHeight="11px" style={{ marginTop: 7 }}>
          {getSubTitle()}
        </Text>
      )}
    </CardWrapper>
  )
}
