import React from 'react'
import { Flex } from 'rebass'
import { Pair, Token } from '@swapr/sdk'
import { TYPE } from '../../../../../../theme'
import { AutoColumn } from '../../../../../Column'
import DataRow from '../DataRow'
import { DateTime } from 'luxon'
import { unwrappedToken } from '../../../../../../utils/wrappedCurrency'

interface PoolSummaryProps {
  liquidityPair: Pair | Token | null
  startTime: Date | null
  endTime: Date | null
  timelocked: boolean
}

export default function PoolSummary({ liquidityPair, startTime, endTime, timelocked }: PoolSummaryProps) {
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
              liquidityPair instanceof Pair
                ? `${unwrappedToken(liquidityPair.token0)?.symbol}/${unwrappedToken(liquidityPair.token1)?.symbol}`
                : liquidityPair instanceof Token
                ? liquidityPair.symbol
                : '-'
            }
          />
          <DataRow
            name="STARTS"
            value={startTime ? DateTime.fromJSDate(startTime).toFormat('dd-MM-yyyy HH:mm') : '-'}
          />
          <DataRow name="ENDS" value={endTime ? DateTime.fromJSDate(endTime).toFormat('dd-MM-yyyy HH:mm') : '-'} />
          <DataRow name="TIMELOCK" value={timelocked ? 'YES' : 'NO'} />
        </AutoColumn>
      </AutoColumn>
    </Flex>
  )
}
