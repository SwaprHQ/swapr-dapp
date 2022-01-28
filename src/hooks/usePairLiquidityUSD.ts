import { gql, useQuery } from '@apollo/client'
import Decimal from 'decimal.js-light'
import { CurrencyAmount, Pair, USD } from '@swapr/sdk'
import { parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'
import { ZERO_USD } from '../constants'

const QUERY = gql`
  query($id: ID!) {
    pair(id: $id) {
      id
      reserveUSD
    }
  }
`
const QUERY_MULTIPLE = gql`
  query($id: [ID!]) {
    pair(id: $id) {
      id
      reserveUSD
    }
  }
`

interface QueryResult {
  pair: { reserveUSD: string }
}

type QueryResultMultiple = QueryResult[]

export function usePairLiquidityUSD(pair?: Pair | null): { loading: boolean; liquidityUSD: CurrencyAmount } {
  const { loading, data, error } = useQuery<QueryResult>(QUERY, {
    variables: { id: pair?.liquidityToken.address.toLowerCase() }
  })

  return useMemo(() => {
    if (loading) return { loading: true, liquidityUSD: ZERO_USD }
    if (!data || !data.pair || !data.pair.reserveUSD || error) return { loading, liquidityUSD: ZERO_USD }
    return {
      loading,
      liquidityUSD: CurrencyAmount.usd(
        parseUnits(new Decimal(data.pair.reserveUSD).toFixed(USD.decimals), USD.decimals).toString()
      )
    }
  }, [data, error, loading])
}

export function useMultiplePairLiquidityUSD(
  pairs?: (Pair | null)[]
): { loading: boolean; liquidityUSD: CurrencyAmount[] } {
  const { loading, data, error } = useQuery<QueryResultMultiple>(QUERY_MULTIPLE, {
    variables: { id: pairs?.map(pair => pair?.liquidityToken.address.toLowerCase()) }
  })

  return useMemo(() => {
    if (loading) return { loading: true, liquidityUSD: [] }
    if (!data || !data.length || error) return { loading, liquidityUSD: [] }
    return {
      loading,
      liquidityUSD: data.map(d => {
        return CurrencyAmount.usd(
          parseUnits(new Decimal(d.pair.reserveUSD).toFixed(USD.decimals), USD.decimals).toString()
        )
      })
    }
  }, [data, error, loading])
}
