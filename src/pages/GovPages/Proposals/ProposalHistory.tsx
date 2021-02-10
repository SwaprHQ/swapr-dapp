import React from 'react'

import { TYPE } from '../../../theme'
import { AutoColumn } from '../../../components/Column'
import { fakeProposalData } from '../constant'
import ProposalCard from './ProposalCard'
import { useRouter } from '../../../hooks/useRouter'

export default function ProposalHistory() {
  const router = useRouter()
  const endedProposals = fakeProposalData.filter(ele => Date.now() > ele.until)

  const onCardClick = (id: number) => {
    router.push({
      pathname: `/governance/${router.query.asset}/pairs/${router.query.pair}/proposals/${id}`,
      state: {
        proposalInfo: fakeProposalData[id - 1]
      }
    })
  }

  if (endedProposals.length === 0) {
    return <TYPE.largeHeader>No Proposals Yet</TYPE.largeHeader>
  }

  return (
    <AutoColumn gap="sm" style={{ width: '100%' }}>
      {endedProposals.map(ele => {
        const FOR = +((ele.for / ele.totalVote) * 100).toFixed(0)
        const AGAINST = +((ele.against / ele.totalVote) * 100).toFixed(0)

        return (
          <ProposalCard
            key={ele.id}
            id={ele.id}
            title={ele.title}
            totalVote={ele.totalVote}
            until={ele.until}
            for={FOR}
            against={AGAINST}
            ended={true}
            onClick={() => onCardClick(ele.id)}
          />
        )
      })}
    </AutoColumn>
  )
}
