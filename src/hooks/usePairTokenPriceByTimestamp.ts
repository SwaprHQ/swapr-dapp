import { Currency, Pair } from '@swapr/sdk'

import { UTCTimestamp } from 'lightweight-charts'
import { useEffect } from 'react'

import { useGetBlockPairTokenPriceQuery } from '../graphql/generated/schema'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from '.'

export const DATE_INTERVALS = {
  DAY: 1,
  WEEK: 7,
  MONTH: 30,
  YEAR: 365,
}

export const DATE_INTERVALS_IN_TIMESTAMP = {
  [DATE_INTERVALS.DAY]: (
    new Date(new Date(1621928700 * 1000).getTime() - 24 * 60 * 60 * 1000).getTime() / 1000
  ).toString(),
  [DATE_INTERVALS.WEEK]: (
    new Date(new Date(1621928700 * 1000).getTime() - 7 * 24 * 60 * 60 * 1000).getTime() / 1000
  ).toString(),
  [DATE_INTERVALS.MONTH]: (
    new Date(1621928700 * 1000).setMonth(new Date(1621928700 * 1000).getMonth() - 1) / 1000
  ).toString(),
  [DATE_INTERVALS.YEAR]: (
    new Date(1621928700 * 1000).setFullYear(new Date(1621928700 * 1000).getFullYear() - 1) / 1000
  ).toString(),
}

type PairTokenPriceByTimestampProps = {
  token0?: Currency
  token1?: Currency
  timestamp: string
}

export type ChartData = { time: UTCTimestamp; value: number }
type GetBlockPairTokenPriceQueryData = { blockTimestamp: string; token1Price: string }

const convertToChartData = (data?: GetBlockPairTokenPriceQueryData[]) => {
  return (
    data?.reduce<ChartData[]>((newArray, { blockTimestamp, token1Price }) => {
      newArray.push({
        time: parseInt(blockTimestamp, 10) as UTCTimestamp,
        value: parseInt(token1Price, 10),
      })
      return newArray
    }, []) || []
  )
}

export function usePairTokenPriceByTimestamp({ token0, token1, timestamp }: PairTokenPriceByTimestampProps) {
  const { chainId } = useActiveWeb3React()

  const wrappedToken0 = wrappedCurrency(token0, chainId)
  const wrappedToken1 = wrappedCurrency(token1, chainId)

  const { data, loading, error, fetchMore } = useGetBlockPairTokenPriceQuery({
    variables: {
      pairAddress: wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase(),
      timestamp,
      skip: 0,
    },
  })

  // useEffect(() => {
  //   if (data?.blockPairTokenPrices.length === 1000) {
  //     fetchMore({
  //       variables: {
  //         offset: data.blockPairTokenPrices.length,
  //       },
  //       updateQuery: (prev, { fetchMoreResult }) => {
  //         if (!fetchMoreResult) return prev
  //         return Object.assign({}, prev, {
  //           blockPairTokenPrices: [...fetchMoreResult.blockPairTokenPrices, ...prev.blockPairTokenPrices],
  //         })
  //       },
  //     })
  //   }
  // }, [data, fetchMore])

  return {
    loading,
    data: convertToChartData(data?.blockPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
    error,
  }
}
