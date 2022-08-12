import { ChainId, CurrencyAmount, Token } from '@swapr/sdk'

import Decimal from 'decimal.js-light'
import { ethers } from 'ethers'
import { useMemo } from 'react'

import { useGetTokenQuery } from '../graphql/generated/schema'
import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from './index'

export function useTokenDerivedNativeCurrency(token?: Token): {
  loading: boolean
  derivedNativeCurrency: CurrencyAmount
} {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  const { loading, data, error } = useGetTokenQuery({ variables: { tokenId: token?.address.toLowerCase() || '' } })

  return useMemo(() => {
    if (loading || !chainId)
      return { loading: true, derivedNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }
    if (!data || !data.token || error)
      return { loading: false, derivedNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId) }

    return {
      loading: false,
      derivedNativeCurrency: CurrencyAmount.nativeCurrency(
        ethers.utils
          .parseUnits(
            new Decimal(data.token.derivedNativeCurrency).toFixed(nativeCurrency.decimals),
            nativeCurrency.decimals
          )
          .toString(),
        chainId
      ),
    }
  }, [chainId, data, error, loading, nativeCurrency])
}
