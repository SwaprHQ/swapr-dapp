import { Currency, Pair, Token } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import {
  convertToChartData,
  GetBlockPairTokenPriceQueryData,
  TIMEFRAME_PROPRETIES,
} from '../components/Charts/simpleChartUtils'
import { useGetPairTokenPricesQuery } from '../graphql/generated/schema'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from '.'

type PairTokenPriceByTimestampProps = {
  currency0?: Currency
  currency1?: Currency
  dateInterval: string
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
