import { useMemo } from 'react'
import { Token, TokenAmount, Trade, ChainId, Pair } from 'dxswap-sdk'
import flatMap from 'lodash.flatmap'

import { useActiveWeb3React } from './index'
import { usePairs } from '../data/Reserves'

import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'

function useAllCommonPairs(tokenA?: Token, tokenB?: Token): Pair[] {
  const { chainId } = useActiveWeb3React()

  const bases = useMemo(() => BASES_TO_CHECK_TRADES_AGAINST[chainId as ChainId] ?? [], [chainId])

  const allPairCombinations: [Token | undefined, Token | undefined][] = useMemo(
    () => [
      // the direct pair
      [tokenA, tokenB],
      // token A against all bases
      ...bases.map((base): [Token | undefined, Token | undefined] => [tokenA, base]),
      // token B against all bases
      ...bases.map((base): [Token | undefined, Token | undefined] => [tokenB, base]),
      // each base against all bases
      ...flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase]))
    ],
    [tokenA, tokenB, bases]
  )

  const allPairs = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      allPairs
        // filter out invalid pairs
        .filter((p): p is Pair => !!p)
        // filter out duplicated pairs
        .filter(
          (p, i, pairs) => i === pairs.findIndex(pair => pair?.liquidityToken.address === p.liquidityToken.address)
        ),
    [allPairs]
  )
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTrade(exactIn: boolean, token: Token, amount: TokenAmount): Trade | null {
  const tokenA = exactIn ? amount?.token : token
  const tokenB = exactIn ? token : amount?.token

  const allowedPairs = useAllCommonPairs(tokenA, tokenB)

  return useMemo(() => {
    if (tokenA && tokenB && amount && allowedPairs.length > 0) {
      return exactIn ? Trade.bestTradeExactIn(allowedPairs, amount, tokenB)[0] ?? null
      : Trade.bestTradeExactOut(allowedPairs, tokenA, amount)[0] ?? null
    }
    return null
  }, [allowedPairs, token, amount])
}
