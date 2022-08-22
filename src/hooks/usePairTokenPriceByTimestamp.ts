import { Currency, Pair } from '@swapr/sdk'

import { useGetBlockPairTokenPriceQuery } from '../graphql/generated/schema'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from '.'

export const DATE_INTERVALS_IN_TIMESTAMP = {
  DAY: new Date(new Date().getTime() - 24 * 60 * 60 * 1000).getTime(),
  WEEK: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000).getTime(),
  MONTH: new Date().setMonth(new Date().getMonth() - 1),
  YEAR: new Date().setFullYear(new Date().getFullYear() - 1),
}

type PairTokenPriceByTimestampProps = {
  token0?: Currency
  token1?: Currency
  timestamp: String
}

type GetBlockPairTokenPriceQueryData = { blockTimestamp: String; token0Price: String }

const convertToChartData = (data?: GetBlockPairTokenPriceQueryData[]) => {
  return (
    data?.reduce<{ time: String; value: String }[]>((newArray, { blockTimestamp, token0Price }) => {
      newArray.push({
        time: blockTimestamp,
        value: token0Price,
      })
      return newArray
    }, []) || []
  )
}

export function usePairTokenPriceByTimestamp({ token0, token1, timestamp }: PairTokenPriceByTimestampProps) {
  const { chainId } = useActiveWeb3React()

  const wrappedToken0 = wrappedCurrency(token0, chainId)
  const wrappedToken1 = wrappedCurrency(token1, chainId)

  const { data, loading, error } = useGetBlockPairTokenPriceQuery({
    variables: {
      pairAddress: wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase(),
      timestamp,
    },
  })

  return {
    loading,
    data: convertToChartData(data?.blockPairTokenPrices as GetBlockPairTokenPriceQueryData[]),
    error,
  }
}
