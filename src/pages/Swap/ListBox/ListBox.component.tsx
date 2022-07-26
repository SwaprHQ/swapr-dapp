import React from 'react'

import { HistoryTrade, HistoryTradeCell } from '../AdvancedSwapMode/AdvancedSwapMode.styles'
import { formatDate } from '../AdvancedSwapMode/AdvancedSwapMode.utils'
import { ListBoxProps } from './ListBox.types'

export const ListBox = ({ amountUSD, amount0, amount1, timestamp }: ListBoxProps) => {
  return (
    <HistoryTrade>
      <HistoryTradeCell>{Number(amountUSD).toFixed(5)}</HistoryTradeCell> {/* TODO: calculate in - out */}
      <HistoryTradeCell>
        <div>{amount0}</div>
        <div>{amount1}</div>
      </HistoryTradeCell>
      <HistoryTradeCell>{formatDate(Number(timestamp) * 1000)}</HistoryTradeCell>
    </HistoryTrade>
  )
}
