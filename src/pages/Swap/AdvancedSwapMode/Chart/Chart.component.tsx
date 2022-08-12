import { useMemo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

export const Chart = ({ symbol }: { symbol?: string }) => {
  const chart = useMemo(() => {
    return (
      <AdvancedRealTimeChart
        symbol={symbol ?? 'USDCUSD'}
        theme="dark"
        style="8" // eslint-disable-line
        autosize
        hide_top_toolbar
        copyrightStyles={{ parent: { display: 'none' } }}
      />
    )
  }, [symbol])

  return <>{chart}</>
}
