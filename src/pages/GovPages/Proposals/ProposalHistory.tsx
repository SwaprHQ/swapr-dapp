import React from 'react'

import { AutoColumn } from '../../../components/Column'
import ProposalCard from './ProposalCard'
import { fakeProposalData } from '../constant'

export default function ProposalHistory() {
  const endedProposals = fakeProposalData.filter(ele => Date.now() > ele.until)

  return (
    <AutoColumn gap="sm" style={{ width: '100%' }}>
      {endedProposals.map((ele, index) => {
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
            ended={true}
          />
        )
      })}
    </AutoColumn>
  )
}
