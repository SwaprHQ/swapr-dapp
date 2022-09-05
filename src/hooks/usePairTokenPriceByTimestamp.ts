import { Currency, Pair, Token } from '@swapr/sdk'

import { UTCTimestamp } from 'lightweight-charts'
import { useEffect, useState } from 'react'

import { PairTokenPriceTimeframe, useGetPairTokenPricesQuery } from '../graphql/generated/schema'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from '.'

export const DATE_INTERVALS = {
  DAY: 'DAY',
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  YEAR: 'YEAR',
}

const convertToSecondsTimestamp = (timestamp: number): string => Math.floor(timestamp / 1000).toString()

export const TIMEFRAME_PROPRETIES = {
  [DATE_INTERVALS.DAY]: {
    timestamp: convertToSecondsTimestamp(new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime()),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.FiveMinutes,
  },
  [DATE_INTERVALS.WEEK]: {
    timestamp: convertToSecondsTimestamp(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).getTime()),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.FifteenMinutes,
  },
  [DATE_INTERVALS.MONTH]: {
    timestamp: convertToSecondsTimestamp(new Date().setMonth(new Date().getMonth() - 1)),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.OneHour,
  },
  [DATE_INTERVALS.YEAR]: {
    timestamp: convertToSecondsTimestamp(new Date().setFullYear(new Date().getFullYear() - 1)),
    pairTokenPriceTimeframe: PairTokenPriceTimeframe.TwelveHours,
  },
}

type PairTokenPriceByTimestampProps = {
  currency0?: Currency
  currency1?: Currency
  dateInterval: string
}

export type ChartData = { time: UTCTimestamp; value: string }

type GetBlockPairTokenPriceQueryData = {
  blockTimestamp: string
  token0Address: string
  token0Price: string
  token1Price: string
}

const convertToChartData = (data?: GetBlockPairTokenPriceQueryData[], token0?: Token) => {
  return (
    data?.reduce<ChartData[]>((newArray, { blockTimestamp, token0Address, token0Price, token1Price }) => {
      newArray.push({
        time: parseInt(blockTimestamp, 10) as UTCTimestamp,
        value: token0?.address.toLowerCase() === token0Address.toLowerCase() ? token0Price : token1Price,
      })
      return newArray
    }, []) || []
  )
}

export function usePairTokenPriceByTimestamp({ currency0, currency1, dateInterval }: PairTokenPriceByTimestampProps) {
  const { chainId } = useActiveWeb3React()
  const [wrappedToken1, setWrappedToken1] = useState<Token>()
  const [pairAddress, setPairAddress] = useState<string>()

  const { data, loading, error } = useGetPairTokenPricesQuery({
    variables: {
      pairAddress,
      timestamp: TIMEFRAME_PROPRETIES[dateInterval].timestamp,
      timeframe: TIMEFRAME_PROPRETIES[dateInterval].pairTokenPriceTimeframe,
    },
  })

  useEffect(() => {
    try {
      const wrappedToken0 = wrappedCurrency(currency0, chainId)
      const wrappedToken1 = wrappedCurrency(currency1, chainId)

      const pairAddress = wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase()
      setWrappedToken1(wrappedToken1)
      setPairAddress(pairAddress)
    } catch (e) {}
  }, [chainId, currency0, currency1])

  return {
    data: convertToChartData(data?.pairTokenPrices as GetBlockPairTokenPriceQueryData[], wrappedToken1),
    loading,
    error,
  }
}
