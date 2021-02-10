import React from 'react'

import { TYPE } from '../../../theme'
import { AutoColumn } from '../../../components/Column'
import { fakeProposalData } from '../constant'
import ProposalCard from './ProposalCard'

export default function ProposalHistory() {
  const endedProposals = fakeProposalData.filter(ele => Date.now() > ele.until)

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
          />
        )
      })}
    </AutoColumn>
  )
}
