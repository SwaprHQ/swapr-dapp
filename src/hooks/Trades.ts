import {
  Currency,
  CurrencyAmount,
  Pair,
  Percent,
  Token,
  Trade,
  UniswapV2RoutablePlatform,
  UniswapV2Trade,
} from '@swapr/sdk'

import { useMemo } from 'react'

import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useIsMultihop, useUserSlippageTolerance } from '../state/user/hooks'
import { sortTradesByExecutionPrice } from '../utils/prices'
import { wrappedCurrency } from '../utils/wrappedCurrency'

import { useActiveWeb3React } from './index'

function useAllCommonPairs(
  currencyA?: Currency,
  currencyB?: Currency,
  platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
): Pair[] {
  const { chainId } = useActiveWeb3React()

  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [tokenA, tokenB] = chainId
    ? [wrappedCurrency(currencyA, chainId), wrappedCurrency(currencyB, chainId)]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      bases
        .flatMap((base): [Token, Token][] => bases.map(otherBase => [base, otherBase]))
        .filter(([t0, t1]) => t0.address !== t1.address),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
        : [],
    [tokenA, tokenB, bases, basePairs]
  )

  const allPairs = usePairs(allPairCombinations, platform)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {})
      ),
    [allPairs]
  )
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactInUniswapV2(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency,
  platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
): Trade | undefined {
  const { chainId } = useActiveWeb3React()
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut, platform)
  const multihop = useIsMultihop()
  const userSlippageTolerance = useUserSlippageTolerance()

  return useMemo(() => {
    const maximumSlippage = new Percent(userSlippageTolerance.toString(), '10000')
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0 && chainId && platform.supportsChain(chainId)) {
      return (
        UniswapV2Trade.computeTradesExactIn({
          pairs: allowedPairs,
          currencyAmountIn,
          currencyOut,
          maximumSlippage,
          maxHops: {
            maxHops: multihop ? 3 : 1,
            maxNumResults: 1,
          },
        })[0] ?? null
      )
    }
    return undefined
  }, [userSlippageTolerance, currencyAmountIn, currencyOut, allowedPairs, chainId, platform, multihop])
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOutUniswapV2(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
): Trade | undefined {
  const { chainId } = useActiveWeb3React()
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency, platform)
  const multihop = useIsMultihop()
  const userSlippageTolerance = useUserSlippageTolerance()

  return useMemo(() => {
    const maximumSlippage = new Percent(userSlippageTolerance.toString(), '10000')
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0 && chainId && platform.supportsChain(chainId)) {
      return (
        UniswapV2Trade.computeTradesExactOut({
          pairs: allowedPairs,
          currencyIn,
          currencyAmountOut,
          maximumSlippage,
          maxHops: {
            maxHops: multihop ? 3 : 1,
            maxNumResults: 1,
          },
        })[0] ?? null
      )
    }
    return undefined
  }, [userSlippageTolerance, currencyIn, currencyAmountOut, allowedPairs, chainId, platform, multihop])
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 * for each supported platform. Order is by lowest price ascending.
 */
export function useTradeExactInAllPlatforms(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency
): (Trade | undefined)[] {
  const bestTrades = [
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.SWAPR),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.UNISWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.SUSHISWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.HONEYSWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.BAOSWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.LEVINSWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.QUICKSWAP),
    useTradeExactInUniswapV2(currencyAmountIn, currencyOut, UniswapV2RoutablePlatform.DFYN),
  ]
  return sortTradesByExecutionPrice(bestTrades).filter(trade => !!trade)
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 * for each supported platform. Order is by lowest price ascending.
 */
export function useTradeExactOutAllPlatforms(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount
): (Trade | undefined)[] {
  const bestTrades = [
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.SWAPR),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.UNISWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.SUSHISWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.HONEYSWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.BAOSWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.LEVINSWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.QUICKSWAP),
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.DFYN),
  ]
  return sortTradesByExecutionPrice(bestTrades).filter(trade => !!trade)
}
