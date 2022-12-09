import { Currency, Pair, Token } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import { useEffect, useState } from 'react'

import { subgraphPriceClients } from '../apollo/client'
import {
  convertToChartData,
  GetBlockPairTokenPriceQueryData,
  TIMEFRAME_PROPRETIES,
} from '../components/Charts/chartUtils'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import { useWeb3ReactCore } from './useWeb3ReactCore'

const GET_PAIR_TOKEN_PRICES_QUERY = gql`
  query getPairTokenPrices($pairAddress: ID, $timestamp: BigInt, $timeframe: PairTokenPriceTimeframe) {
    pairTokenPrices(
      first: 1000
      where: { pair_: { id: $pairAddress }, blockTimestamp_gt: $timestamp, timeframe: $timeframe }
      orderBy: blockNumber
      orderDirection: asc
    ) {
      id
      pair {
        token1 {
          symbol
        }
        token0 {
          symbol
        }
      }
      token0Address
      token1Address
      token0Price
      token1Price
      blockNumber
      blockTimestamp
      timeframe
    }
  }
`

type PairTokenPriceByTimestampProps = {
  currency0?: Currency
  currency1?: Currency
  dateInterval: string
}

export function usePairTokenPriceByTimestamp({ currency0, currency1, dateInterval }: PairTokenPriceByTimestampProps) {
  const { chainId } = useWeb3ReactCore()
  const [wrappedToken1, setWrappedToken1] = useState<Token>()
  const [pairAddress, setPairAddress] = useState<string>()

  const { data, loading, error } = useQuery(GET_PAIR_TOKEN_PRICES_QUERY, {
    variables: {
      pairAddress,
      timestamp: TIMEFRAME_PROPRETIES[dateInterval].timestamp,
      timeframe: TIMEFRAME_PROPRETIES[dateInterval].pairTokenPriceTimeframe,
    },
    client: chainId ? subgraphPriceClients[chainId] : undefined,
  })

  useEffect(() => {
    try {
      const [wrappedToken0, wrappedToken1] = [wrappedCurrency(currency0, chainId), wrappedCurrency(currency1, chainId)]
      const pairAddress = wrappedToken0 && wrappedToken1 && Pair.getAddress(wrappedToken0, wrappedToken1).toLowerCase()

      setWrappedToken1(wrappedToken1)
      setPairAddress(pairAddress)
    } catch (e) {
      console.error(e)
    }
  }, [chainId, currency0, currency1])

  return {
    data: convertToChartData(data?.pairTokenPrices as GetBlockPairTokenPriceQueryData[], wrappedToken1),
    loading,
    error,
  }
}
