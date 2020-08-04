import { useMemo } from 'react'
import { Token, TokenAmount, Trade, ChainId, Pair } from 'dxswap-sdk'
import flatMap from 'lodash.flatmap'
import { useAsync } from 'react-use';

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
export function useTrade(exactIn: boolean, token: Token, amount: TokenAmount): 
{ loading: boolean, error?: any, value?: Trade[] } | null {
  const tokenA = exactIn ? amount?.token : token
  const tokenB = exactIn ? token : amount?.token  
  const allowedPairs = useAllCommonPairs(tokenA, tokenB)
  
  return useAsync(async () => {
    if (allowedPairs.length > 0 && amount && (tokenA || tokenB)){
      return exactIn ? await Trade.bestTradeExactIn(allowedPairs, amount, tokenB)
        : await Trade.bestTradeExactOut(allowedPairs, tokenA, amount)
      }
    else return null
  }, [tokenA, tokenB, allowedPairs]);
  
}
