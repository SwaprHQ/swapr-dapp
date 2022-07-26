import React, { useMemo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

export const AdvancedChart = ({
  inputTokenSymbol,
  outputTokenSymbol,
}: {
  inputTokenSymbol?: string
  outputTokenSymbol?: string
}) => {
  const memoizedAdvancedRealTimeChart = useMemo(() => {
    const symbol = inputTokenSymbol && outputTokenSymbol ? `${inputTokenSymbol}${outputTokenSymbol}` : 'USDCUSD'
    return (
      <AdvancedRealTimeChart
        symbol={symbol}
        theme="dark"
        style="3"
        autosize
        copyrightStyles={{ parent: { display: 'none' } }}
      />
    )
  }, [inputTokenSymbol, outputTokenSymbol])

  return <>{memoizedAdvancedRealTimeChart}</>
}
