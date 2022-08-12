import { parseUnits } from '@ethersproject/units'
import { ChainId, CurrencyAmount, Pair } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { useMemo } from 'react'

import { useGetPairQuery } from '../graphql/generated/schema'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'

export function usePairReserveNativeCurrency(pair?: Pair): { loading: boolean; reserveNativeCurrency: CurrencyAmount } {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  const { loading, data, error } = useGetPairQuery({
    variables: { pairId: pair?.liquidityToken.address.toLowerCase() || '' },
  })

  return useMemo(() => {
    if (loading)
      return { loading: true, reserveNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }
    if (!data || error || !chainId || !data.pair)
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
