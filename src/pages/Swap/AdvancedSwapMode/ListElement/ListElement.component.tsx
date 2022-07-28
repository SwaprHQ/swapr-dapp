import { formatDistance, subDays } from 'date-fns'
import React from 'react'

import { Cell, Root } from './ListElement.styles'
import { ListElementProps } from './ListElement.types'

export const ListElement = ({ amountUSD, amount0, amount1, timestamp }: ListElementProps) => {
  const formatDate = (timestamp: number) => {
    try {
      return formatDistance(subDays(new Date(timestamp), 3), new Date(), {
        addSuffix: true,
      })
    } catch {
      return '-'
    }
  }

  return (
    <Root>
      <Cell>{Number(amountUSD).toFixed(5)}</Cell>
      <Cell>
        <div>{amount0}</div>
        <div>{amount1}</div>
      </Cell>
      <Cell>{formatDate(Number(timestamp) * 1000)}</Cell>
    </Root>
  )
}
