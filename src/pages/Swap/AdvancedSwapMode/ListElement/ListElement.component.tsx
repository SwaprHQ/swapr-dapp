import React from 'react'

import { formatDate } from '../AdvancedSwapMode.utils'
import { Cell, Root } from './ListElement.styles'
import { ListElementProps } from './ListElement.types'

export const ListElement = ({ amountUSD, amount0, amount1, timestamp }: ListElementProps) => {
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
