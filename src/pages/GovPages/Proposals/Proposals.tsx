import React from 'react'

import { AutoColumn } from '../../../components/Column'
import { useRouter } from '../../../hooks/useRouter'
import { fakeProposalData } from '../constant'
import ProposalCard from './ProposalCard'

export interface ProposalProps {
  id: number
  title: string
  totalVote: number
  for: number
  against: number
  until: number
}

interface ProposalsProps {
  asset: string
  pair: string
}

export default function Proposals(props: ProposalsProps) {
  const router = useRouter()

  const onCardClick = (id: number) => {
    router.push({
      pathname: `/governance/${props.asset}/pairs/${props.pair}/proposals/${id}`,
      state: {
        proposalInfo: fakeProposalData[id - 1]
      }
    })
  }

  return (
    <AutoColumn gap="sm" style={{ width: '100%' }}>
      {fakeProposalData.map((ele, index) => {
        const isVotingEnded = Date.now() > ele.until
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
            isEnded={isVotingEnded}
            onClick={() => onCardClick(ele.id)}
          />
        )
      })}
    </AutoColumn>
  )
}
