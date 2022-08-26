import { Currency, Pair } from '@swapr/sdk'

import { UTCTimestamp } from 'lightweight-charts'
import { useEffect } from 'react'

import {
  useGetFifteenMinutesPairTokenPricesQuery,
  useGetFiveMinutesPairTokenPricesQuery,
  useGetOneHourPairTokenPricesQuery,
  useGetTwelveHoursPairTokenPricesQuery,
} from '../graphql/generated/schema'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from '.'

export const DATE_INTERVALS = {
  DAY: 1,
  WEEK: 7,
  MONTH: 30,
  YEAR: 365,
}

const mayTimestamp = 1621928700 * 1000

export const DATE_INTERVALS_IN_TIMESTAMP = {
  [DATE_INTERVALS.DAY]: (new Date(new Date(mayTimestamp).getTime() - 24 * 60 * 60 * 1000).getTime() / 1000).toString(),
  [DATE_INTERVALS.WEEK]: (
    new Date(new Date(mayTimestamp).getTime() - 7 * 24 * 60 * 60 * 1000).getTime() / 1000
  ).toString(),
  [DATE_INTERVALS.MONTH]: (new Date(mayTimestamp).setMonth(new Date(mayTimestamp).getMonth() - 1) / 1000).toString(),
  [DATE_INTERVALS.YEAR]: (
    new Date(mayTimestamp).setFullYear(new Date(mayTimestamp).getFullYear() - 1) / 1000
  ).toString(),
}

type PairTokenPriceByTimestampProps = {
  currency0?: Currency
  currency1?: Currency
  timestamp: string
  timeframe: number
}

export type ChartData = { time: UTCTimestamp; value: string }
type GetBlockPairTokenPriceQueryData = { blockTimestamp: string; token1Price: string }

const convertToChartData = (data?: GetBlockPairTokenPriceQueryData[]) => {
  return (
    data?.reduce<ChartData[]>((newArray, { blockTimestamp, token1Price }) => {
      newArray.push({
        time: parseInt(blockTimestamp, 10) as UTCTimestamp,
        value: token1Price,
      })
      return newArray
    }, []) || []
  )
}

export function usePairTokenPriceByTimestamp({
  currency0,
  currency1,
  timestamp,
  timeframe,
}: PairTokenPriceByTimestampProps) {
  const { chainId } = useActiveWeb3React()

  const wrappedToken0 = wrappedCurrency(currency0, chainId)
  const wrappedToken1 = wrappedCurrency(currency1, chainId)
  const pairAddress = wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase()

  const {
    data: fiveMinutesData,
    loading: fiveMinutesLoading,
    error: fiveMinutesError,
  } = useGetFiveMinutesPairTokenPricesQuery({
    variables: {
      pairAddress,
      timestamp: 0,
    },
  })
  const {
    data: fifteenMinutesData,
    loading: fifteenMinutesLoading,
    error: fifteenMinutesError,
  } = useGetFifteenMinutesPairTokenPricesQuery({
    variables: {
      pairAddress,
      timestamp: 0,
    },
  })
  const {
    data: oneHourData,
    loading: oneHourLoading,
    error: oneHourError,
  } = useGetOneHourPairTokenPricesQuery({
    variables: {
      pairAddress,
      timestamp: 0,
    },
  })
  const {
    data: twelveHoursData,
    loading: twelveHoursLoading,
    error: twelveHoursError,
  } = useGetTwelveHoursPairTokenPricesQuery({
    variables: {
      pairAddress,
      timestamp: 0,
    },
  })

  const CHART_INFO_BY_TIMEFRAME = {
    [DATE_INTERVALS.DAY]: {
      loading: fiveMinutesLoading,
      data: convertToChartData(fiveMinutesData?.fiveMinutesPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
      error: fiveMinutesError,
    },
    [DATE_INTERVALS.WEEK]: {
      loading: fifteenMinutesLoading,
      data: convertToChartData(fifteenMinutesData?.fifteenMinutesPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
      error: fifteenMinutesError,
    },
    [DATE_INTERVALS.MONTH]: {
      loading: oneHourLoading,
      data: convertToChartData(oneHourData?.oneHourPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
      error: oneHourError,
    },
    [DATE_INTERVALS.YEAR]: {
      loading: twelveHoursLoading,
      data: convertToChartData(twelveHoursData?.twelveHoursPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
      error: twelveHoursError,
    },
  }

  return CHART_INFO_BY_TIMEFRAME[timeframe]
}
