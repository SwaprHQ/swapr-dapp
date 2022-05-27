import React from 'react'
import { Flex } from 'rebass'
import { Percent, TokenAmount } from '@swapr/sdk'
import { TYPE } from '../../../../../../theme'
import { AutoColumn } from '../../../../../Column'
import DataRow from '../DataRow'

interface RewardSummaryProps {
  reward: TokenAmount[]
  apr: Percent
  stakingCap: TokenAmount | null
}

export default function RewardSummary({ reward, apr, stakingCap }: RewardSummaryProps) {
  return (
    <Flex flexDirection="column" justifyContent="stretch" width="100%">
      <AutoColumn gap="8px">
        <TYPE.small fontWeight="600" color="text4" letterSpacing="0.08em">
          REWARD SUMMARY
        </TYPE.small>
        <DataRow name="REWARDS" value={reward.map(ite => `${ite.toExact()} ${ite.token.symbol}`).join(', ')} />
        <DataRow
          name="MAX POOL SIZE"
          value={stakingCap && stakingCap.greaterThan('0') ? stakingCap.toSignificant(4) : '-'}
        />
        <DataRow name="APR" value={`${apr.toSignificant(2)}%`} />
      </AutoColumn>
    </Flex>
  )
}
