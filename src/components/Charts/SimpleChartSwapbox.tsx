import { Currency } from '@swapr/sdk'

import React, { useLayoutEffect } from 'react'

import { usePairTokenPriceByTimestamp } from '../../hooks/usePairTokenPriceByTimestamp'
import { SimpleChart } from './SimpleChart'
import { DATE_INTERVALS } from './simpleChartUtils'

export default function SimpleChartSwapbox({ currency0, currency1 }: { currency0?: Currency; currency1?: Currency }) {
  const [selectedInterval, setSelectedInterval] = React.useState<string>(DATE_INTERVALS.DAY)
  const [isCurrenciesSwitched, setIsCurrenciesSwitched] = React.useState(false)

  useLayoutEffect(() => setIsCurrenciesSwitched(false), [currency0, currency1])

  const currencies = isCurrenciesSwitched ? { currency0: currency1, currency1: currency0 } : { currency0, currency1 }

  const { data, loading } = usePairTokenPriceByTimestamp({
    currency0: currencies.currency0,
    currency1: currencies.currency1,
    dateInterval: selectedInterval,
  })

  return (
    <SimpleChart
      data={data}
      currency0={currencies.currency0}
      currency1={currencies.currency1}
      loading={loading}
      setSelectedInterval={setSelectedInterval}
      selectedInterval={selectedInterval}
      setIsCurrenciesSwitched={setIsCurrenciesSwitched}
      isCurrenciesSwitched={isCurrenciesSwitched}
    ></SimpleChart>
  )
}
