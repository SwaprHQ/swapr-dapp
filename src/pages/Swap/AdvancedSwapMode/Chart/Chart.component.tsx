import { memo } from 'react'
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets'

export const Chart = memo(({ symbol }: { symbol?: string }) => {
  return (
    <AdvancedRealTimeChart
      symbol={symbol ?? 'USDCUSD'}
      theme="dark"
      style="8" // eslint-disable-line
      autosize
      allow_symbol_change={false}
      disabled_features={['header_chart_type', 'header_compare', 'header_indicators']}
      copyrightStyles={{ parent: { display: 'none' } }}
      interval="60"
    />
  )
})
