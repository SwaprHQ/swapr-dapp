import { parseUnits } from '@ethersproject/units'
import { ChainId, CurrencyAmount, Pair } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import Decimal from 'decimal.js-light'
import { useMemo } from 'react'

import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from '.'

const QUERY = gql`
  query($pairId: ID!) {
    pair(id: $pairId) {
      id
      reserveNativeCurrency
    }
  }
`

interface QueryResult {
  pair: { reserveNativeCurrency: string }
}

export function usePairReserveNativeCurrency(pair?: Pair): { loading: boolean; reserveNativeCurrency: CurrencyAmount } {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  const { loading, data, error } = useQuery<QueryResult>(QUERY, {
    variables: { pairId: pair?.liquidityToken.address.toLowerCase() },
  })

  return useMemo(() => {
    if (loading)
      return { loading: true, reserveNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }
    if (!data || error || !chainId)
      return { loading: false, reserveNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }
    return {
      loading: false,
      reserveNativeCurrency: CurrencyAmount.nativeCurrency(
        parseUnits(
          new Decimal(data.pair.reserveNativeCurrency).toFixed(nativeCurrency.decimals),
          nativeCurrency.decimals
        ).toString(),
        chainId
      ),
    }
  }, [loading, chainId, data, error, nativeCurrency])
}
