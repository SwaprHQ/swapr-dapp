import { Pair, Token, TokenAmount } from '@swapr/sdk'

import { getAddress, parseUnits } from 'ethers/lib/utils'
import { useMemo } from 'react'

import { useGetPairsQuery } from '../graphql/generated/schema'

import { useActiveWeb3React } from './index'

export function useAllPairs(): { loading: boolean; pairs: Pair[] } {
  const { chainId } = useActiveWeb3React()
  const { loading, data, error } = useGetPairsQuery()

  return useMemo(() => {
    if (loading || !chainId) return { loading: true, pairs: [] }
    if (!data || error) return { loading: false, pairs: [] }
    return {
      loading: false,
      pairs: data.pairs.reduce((pairs: Pair[], rawPair) => {
        const { token0, token1, reserve0, reserve1 } = rawPair
        const tokenAmountA = new TokenAmount(
          new Token(chainId, getAddress(token0.address), parseInt(token0.decimals), token0.symbol, token0.name),
          parseUnits(reserve0, token0.decimals).toString()
        )
        const tokenAmountB = new TokenAmount(
          new Token(chainId, getAddress(token1.address), parseInt(token1.decimals), token1.symbol, token1.name),
          parseUnits(reserve1, token1.decimals).toString()
        )
        pairs.push(new Pair(tokenAmountA, tokenAmountB))
        return pairs
      }, []),
    }
  }, [chainId, data, error, loading])
}
