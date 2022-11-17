import { Currency } from '@swapr/sdk'

import React, { useLayoutEffect, useState } from 'react'

import { usePairTokenPriceByTimestamp } from '../../hooks/usePairTokenPriceByTimestamp'
import { DATE_INTERVALS } from '../Charts/chartUtils'
import { SimpleChart } from './SimpleChart'

type SimpleChartContainerProps = { currency0?: Currency; currency1?: Currency }

export const SimpleChartContainer = ({ currency0, currency1 }: SimpleChartContainerProps) => {
  const [selectedInterval, setSelectedInterval] = useState(DATE_INTERVALS.DAY)
  const [isCurrenciesSwitched, setIsCurrenciesSwitched] = useState(false)

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
    />
  )
}
