import React, { useMemo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

export const AdvancedChart = ({ symbol }: { symbol?: string }) => {
  const memoizedAdvancedRealTimeChart = useMemo(() => {
    return (
      <AdvancedRealTimeChart
        symbol={symbol ?? 'USDCUSD'}
        theme="dark"
        style="3"
        autosize
        hide_top_toolbar
        copyrightStyles={{ parent: { display: 'none' } }}
      />
    )
  }, [symbol])

  return <>{memoizedAdvancedRealTimeChart}</>
}
