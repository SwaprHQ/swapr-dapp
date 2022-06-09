import { ChainId, CurrencyAmount, Token } from '@swapr/sdk'

import { gql, useQuery } from '@apollo/client'
import Decimal from 'decimal.js-light'
import { ethers } from 'ethers'
import { useMemo } from 'react'

import { useNativeCurrency } from './useNativeCurrency'

import { useActiveWeb3React } from '.'

export function useTokenDerivedNativeCurrency(
  token?: Token
): { loading: boolean; derivedNativeCurrency: CurrencyAmount } {
  const { chainId } = useActiveWeb3React()
  const nativeCurrency = useNativeCurrency()

  interface QueryResult {
    token: { derivedNativeCurrency: string }
  }

  const { loading, data, error } = useQuery<QueryResult>(
    gql`
      query getTokenDerivedNativeCurrency($tokenId: ID!) {
        token(id: $tokenId) {
          derivedNativeCurrency
        }
      }
    `,
    { variables: { tokenId: token?.address.toLowerCase() } }
  )

  return useMemo(() => {
    if (loading || !chainId)
      return { loading: true, derivedNativeCurrency: CurrencyAmount.nativeCurrency('0', chainId || ChainId.MAINNET) }
    if (!data || data.token === null || error)
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
