import React from 'react'

import { TYPE } from '../../../theme'
import { AutoColumn } from '../../../components/Column'
import { fakeProposalData } from '../constant'
import ProposalCard from './ProposalCard'

export default function Proposals() {
  const inProgressProposals = fakeProposalData.filter(ele => Date.now() <= ele.until)

  if (inProgressProposals.length === 0) {
    return <TYPE.largeHeader>No Proposals Yet</TYPE.largeHeader>
  }

  return (
    <AutoColumn gap="sm" style={{ width: '100%' }}>
      {inProgressProposals.map(ele => {
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
            ended={false}
          />
        )
      })}
    </AutoColumn>
  )
}
