import React from 'react'
import { Flex } from 'rebass'

import { TextCard } from './styleds'
import { TYPE } from '../../../theme'
import { RowBetween } from '../../../components/Row'
import { LightCard } from '../../../components/Card'
import { AutoColumn } from '../../../components/Column'

export interface ProposalProps {
  id: number
  title: string
  totalVote: number
  for: number
  against: number
  createdAt: number
}

export const fakeProposalData: ProposalProps[] = [
  { id: 1, title: 'USDC/ETH Pool Fee to 0.15%', totalVote: 23, for: 20, against: 3, createdAt: 1610735340 }
]

export default function ProposalCard(props: ProposalProps) {
  return (
    <LightCard>
      <AutoColumn gap="md">
        <RowBetween>
          <Flex flexDirection="column">
            <Flex>
              <TextCard>{props.id}</TextCard>
              <TYPE.small>{props.createdAt + ' | ' + props.totalVote}</TYPE.small>
            </Flex>
            {props.title}
          </Flex>
          <Flex flexDirection="column">
            <TYPE.small>{'FOR ' + props.for}</TYPE.small>
            <TYPE.small>{'AGAINST ' + props.against}</TYPE.small>
          </Flex>
        </RowBetween>
      </AutoColumn>
    </LightCard>
  )
}
