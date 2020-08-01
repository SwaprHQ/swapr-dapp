import { useMemo } from 'react'
import { Token, TokenAmount, Trade, ChainId, Pair } from 'dxswap-sdk'
import flatMap from 'lodash.flatmap'
import {useAsync} from 'react-use';

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
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(amountIn?: TokenAmount, tokenOut?: Token): Trade | null {
  const inputToken = amountIn?.token
  const outputToken = tokenOut

  const allowedPairs = useAllCommonPairs(inputToken, outputToken)
  
  const tradeExactIn = useAsync(async () => {
    return await Trade.bestTradeExactIn(allowedPairs, amountIn, tokenOut)
  }, [allowedPairs, amountIn, tokenOut]);

  if (!tradeExactIn.loading){
    console.log(tradeExactIn)
    console.log(allowedPairs, amountIn, inputToken, tokenOut)
    return tradeExactIn.value ? tradeExactIn.value[0] : null
  }
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(tokenIn?: Token, amountOut?: TokenAmount): Trade | null {
  const inputToken = tokenIn
  const outputToken = amountOut?.token

  const allowedPairs = useAllCommonPairs(inputToken, outputToken)
  
  const tradeExactOut = useAsync(async () => {
      return await Trade.bestTradeExactOut(allowedPairs, tokenIn, amountOut)
  }, [allowedPairs, tokenIn, amountOut]);
  
  if (!tradeExactOut.loading){
    // console.log(tradeExactOut)
    // console.log(allowedPairs, amountOut, inputToken, tokenIn)
    return tradeExactOut.value ? tradeExactOut.value[0] : null
  }
}

/**
 * Returns the best trade
 */
export function useTrade(tokenIn: boolean, token: Token, amount: TokenAmount): Trade | null {

  const allowedPairs = useAllCommonPairs(token, amount?.token)
  console.log(token, amount?.token)
  const trade = useAsync(async () => {  
    return tokenIn ? await Trade.bestTradeExactIn(allowedPairs, amount, token)
    : await Trade.bestTradeExactOut(allowedPairs, token, amount)
  }, [allowedPairs, tokenIn, token, amount])
  
  if (!trade.loading){
    console.log(trade)
    console.log(allowedPairs, tokenIn, token, amount)
    return trade.value ? trade.value[0] : null
  }
  
}
