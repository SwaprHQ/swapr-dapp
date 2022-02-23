import {
  Currency,
  CurrencyAmount,
  Pair,
  UniswapV2RoutablePlatform,
  Token,
  UniswapV2Trade,
  Percent,
  CurveTrade,
  RoutablePlatform,
  Trade,
  ChainId
} from '@swapr/sdk'
import flatMap from 'lodash.flatmap'
import { useMemo, useEffect, useState } from 'react'
import { BASES_TO_CHECK_TRADES_AGAINST } from '../constants'
import { PairState, usePairs } from '../data/Reserves'
import { useIsMultihop } from '../state/user/hooks'
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
      flatMap(bases, (base): [Token, Token][] => bases.map(otherBase => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address
      ),
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
            ...basePairs
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
): UniswapV2Trade | undefined {
  const { chainId } = useActiveWeb3React()
  const allowedPairs = useAllCommonPairs(currencyAmountIn?.currency, currencyOut, platform)
  const multihop = useIsMultihop()

  return useMemo(() => {
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0 && chainId && platform.supportsChain(chainId)) {
      return (
        UniswapV2Trade.bestTradeExactIn({
          currencyAmountIn,
          currencyOut,
          maximumSlippage: new Percent('3', '100'),
          pairs: allowedPairs,
          maxHops: {
            maxHops: multihop ? 3 : 1,
            maxNumResults: 1
          }
        }) ?? undefined
      )
    }
    return undefined
  }, [currencyAmountIn, currencyOut, allowedPairs, chainId, platform, multihop])
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactInCurve(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency
): CurveTrade | undefined {
  const { chainId, library } = useActiveWeb3React()
  const [trade, setTrade] = useState<CurveTrade>()

  useEffect(() => {
    if (!library || !currencyAmountIn || !currencyOut || !chainId || !RoutablePlatform.CURVE.supportsChain(chainId))
      return

    CurveTrade.bestTradeExactIn({
      currencyAmountIn,
      currencyOut,
      maximumSlippage: new Percent('3', '100')
    })
      .then(async newTrade => {
        // Update if either txs differ
        const prevSwapTx = await trade?.swapTransaction()
        const nextSwapTx = await newTrade?.swapTransaction()

        if (prevSwapTx?.data !== nextSwapTx?.data) {
          setTrade(newTrade)
        }
      })
      .catch((e: Error) => console.log('useTradeExactInCurve: ', e))
  }, [currencyAmountIn, currencyOut, chainId, library])

  return trade
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOutUniswapV2(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount,
  platform: UniswapV2RoutablePlatform = UniswapV2RoutablePlatform.SWAPR
): UniswapV2Trade | undefined {
  const { chainId } = useActiveWeb3React()
  const allowedPairs = useAllCommonPairs(currencyIn, currencyAmountOut?.currency, platform)
  const multihop = useIsMultihop()

  return useMemo(() => {
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0 && chainId && platform.supportsChain(chainId)) {
      return (
        UniswapV2Trade.bestTradeExactOut({
          currencyIn,
          currencyAmountOut,
          maximumSlippage: new Percent('3', '100'),
          pairs: allowedPairs,
          maxHops: {
            maxHops: multihop ? 3 : 1,
            maxNumResults: 1
          }
        }) ?? undefined
      )
    }
    return undefined
  }, [currencyIn, currencyAmountOut, allowedPairs, chainId, platform, multihop])
}

export interface UseUniswapV2PlatformAllowedPairs {
  currencyA?: Currency
  currencyB?: Currency
  chainId?: ChainId
}

export function useUniswapV2PlatformAllowedPairs({ currencyA, currencyB }: UseUniswapV2PlatformAllowedPairs) {
  // Todo: DRY
  const uniswapV2AllowedPairsList: {
    platform: UniswapV2RoutablePlatform
    allowedPairs: Pair[]
  }[] = [
    {
      platform: UniswapV2RoutablePlatform.SWAPR,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.SWAPR)
    },
    {
      platform: UniswapV2RoutablePlatform.UNISWAP,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.UNISWAP)
    },
    {
      platform: UniswapV2RoutablePlatform.SUSHISWAP,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.SUSHISWAP)
    },
    {
      platform: UniswapV2RoutablePlatform.HONEYSWAP,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.HONEYSWAP)
    },
    {
      platform: UniswapV2RoutablePlatform.BAOSWAP,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.BAOSWAP)
    },
    {
      platform: UniswapV2RoutablePlatform.LEVINSWAP,
      allowedPairs: useAllCommonPairs(currencyA, currencyB, UniswapV2RoutablePlatform.LEVINSWAP)
    }
  ]

  return uniswapV2AllowedPairsList
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 * for each supported platform. Order is by lowest price ascending.
 */
export function useTradeExactInAllPlatforms(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency
): (Trade | undefined)[] {
  // All trades including Curve, Unsiwap V2 and CowSwap
  const [bestTrades, setBesTrades] = useState<(Trade | undefined)[]>([])
  // Chain Id
  const { chainId } = useActiveWeb3React()
  // Uniswap V2 Trade option: using multi-hop option
  const uniswapV2IsMultihop = useIsMultihop()
  // List of Uniswap V2 pairs per platform
  const uniswapV2AllowedPairsList = useUniswapV2PlatformAllowedPairs({
    currencyA: currencyAmountIn?.currency,
    currencyB: currencyOut
  })

  useEffect(() => {
    // Early exit and clean state if necessary
    if (!currencyAmountIn || !currencyOut || !chainId) {
      if (bestTrades.length > 0) {
        setBesTrades([])
      }
      return
    }

    console.log('useTradeExactInAllPlatforms: Computing trades from UniswapV2 and Curve')

    // Calculate trade output from: Uniswap V2 and its forks, Curve

    // Promisify the Uniswap trade list
    const uniswapV2TradesList = uniswapV2AllowedPairsList
      .filter(({ platform, allowedPairs }) => allowedPairs.length > 0 && platform.supportsChain(chainId))
      .map(async ({ allowedPairs }) => {
        return (
          UniswapV2Trade.bestTradeExactIn({
            currencyAmountIn,
            currencyOut,
            maximumSlippage: new Percent('3', '100'),
            pairs: allowedPairs,
            maxHops: {
              maxHops: uniswapV2IsMultihop ? 3 : 1,
              maxNumResults: 1
            }
          }) ?? undefined
        )
      })

    const curveTrade = new Promise<CurveTrade | undefined>(resolve => {
      CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut,
        maximumSlippage: new Percent('3', '100')
      })
        .then(resolve)
        .catch(console.log) // The next step does not care about the error.
    })

    Promise.all([...(uniswapV2TradesList as any), curveTrade])
      .then(trades => trades.filter(trade => !!trade))
      .then(trades => {
        console.log({ trades })
        setBesTrades(trades)
      })
      .catch()
  }, [uniswapV2IsMultihop, uniswapV2AllowedPairsList, chainId, currencyAmountIn, currencyOut])

  return useMemo(() => sortTradesByExecutionPrice(bestTrades), [bestTrades])
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
    useTradeExactOutUniswapV2(currencyIn, currencyAmountOut, UniswapV2RoutablePlatform.LEVINSWAP)
  ]
  return sortTradesByExecutionPrice(bestTrades).filter(trade => !!trade)
}
