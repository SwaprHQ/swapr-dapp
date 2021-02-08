import React from 'react'

import { AutoColumn } from '../../../components/Column'
import ProposalCard from './ProposalCard'

export interface ProposalProps {
  id: number
  title: string
  totalVote: number
  for: number
  against: number
  until: number
}

const fakeProposalData: ProposalProps[] = [
  {
    id: 1,
    title: 'USDC/ETH Pool Fee to 0.05%',
    totalVote: 45,
    for: 35,
    against: 10,
    until: new Date('Jan 18, 2021 03:24:00').getTime()
  },
  {
    id: 2,
    title: 'USDC/ETH Pool Fee to 0.09%',
    totalVote: 45,
    for: 10,
    against: 35,
    until: new Date('Jan 16, 2021 03:24:00').getTime()
  },
  {
    id: 3,
    title: 'USDC/ETH Pool Fee to 0.15%',
    totalVote: 23,
    for: 20,
    against: 3,
    until: new Date('May 25, 2021 03:24:00').getTime()
  }
]

export default function Proposals() {
  return (
    <AutoColumn gap="sm" style={{ width: '100%' }}>
      {fakeProposalData.map((ele, index) => {
        const ended = Date.now() > ele.until
        const FOR = +((ele.for / ele.totalVote) * 100).toFixed(0)
        const AGAINST = +((ele.against / ele.totalVote) * 100).toFixed(0)

        return (
          <ProposalCard
            key={index}
            id={ele.id}
            title={ele.title}
            totalVote={ele.totalVote}
            until={ele.until}
            for={FOR}
            against={AGAINST}
            ended={ended}
          />
        )
      })}
    </AutoColumn>
  )
}
