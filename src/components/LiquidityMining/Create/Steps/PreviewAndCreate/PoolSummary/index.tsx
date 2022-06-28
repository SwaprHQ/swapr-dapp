import { Pair, Token } from '@swapr/sdk'

import { DateTime } from 'luxon'
import React from 'react'
import { Flex } from 'rebass'

import { TYPE } from '../../../../../../theme'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'
import { AutoColumn } from '../../../../../Column'
import DataRow from '../DataRow'

interface PoolSummaryProps {
  stakePair?: Pair
  stakeToken?: Token
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
}

export default function PoolSummary({ stakePair, stakeToken, startTime, endTime, timelocked }: PoolSummaryProps) {
  return (
    <Flex flexDirection="column" justifyContent="stretch" flex="1">
      <AutoColumn gap="8px">
        <TYPE.small fontWeight="600" color="text4" letterSpacing="0.08em">
          POOL SUMMARY
        </TYPE.small>
        <AutoColumn gap="4px">
          <DataRow
            name="CAMPAIGN"
            value={
              stakePair
                ? `${unwrappedToken(stakePair.token0)?.symbol}/${unwrappedToken(stakePair.token1)?.symbol}`
                : stakeToken
                ? stakeToken.symbol
                : '-'
            }
          />
          <DataRow
            name="STARTS"
            value={startTime ? DateTime.fromJSDate(startTime).toFormat('yyyy-MM-dd HH:mm') : '-'}
          />
          <DataRow name="ENDS" value={endTime ? DateTime.fromJSDate(endTime).toFormat('yyyy-MM-dd HH:mm') : '-'} />
          <DataRow name="TIMELOCK" value={timelocked ? 'YES' : 'NO'} />
        </AutoColumn>
      </AutoColumn>
    </Flex>
  )
}
