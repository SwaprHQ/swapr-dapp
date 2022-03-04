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
    // eslint-disable-next-line
  }, [currencyAmountIn?.currency.address, currencyOut?.address, chainId, library])

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

export interface UseTradeExactAllPlatformsResult {
  loading: boolean
  trades: Trade[]
}

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 * for each supported platform. Order is by lowest price ascending.
 */
export function useTradeExactInAllPlatforms(
  currencyAmountIn?: CurrencyAmount,
  currencyOut?: Currency
): UseTradeExactAllPlatformsResult {
  const [loading, setLoading] = useState(true)
  // All trades including Curve, Unsiwap V2 and CowSwap
  const [trades, setTrades] = useState<Trade[]>([])
  // Chain Id
  const { chainId } = useActiveWeb3React()
  // Uniswap V2 Trade option: using multi-hop option
  const uniswapV2IsMultihop = useIsMultihop()
  // List of Uniswap V2 pairs per platform
  const uniswapV2AllowedPairsList = [
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.SWAPR),
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.UNISWAP),
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.SUSHISWAP),
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.HONEYSWAP),
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.BAOSWAP),
    useAllCommonPairs(currencyAmountIn?.currency, currencyOut, UniswapV2RoutablePlatform.LEVINSWAP)
  ].filter(platformPairs => platformPairs.length !== 0)

  // Used to trigger computing trade route
  const currencyInAndOutAdddress = `${currencyOut?.address}-${currencyAmountIn?.currency.address}`

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountIn || !currencyOut || !chainId) {
      setTrades([])
      setLoading(false)
      return
    }

    console.log('useTradeExactInAllPlatforms: Computing trades from UniswapV2 and Curve')
    setLoading(true)

    // Calculate trade output from: Uniswap V2 and its forks, Curve

    // Promisify the Uniswap trade list
    const uniswapV2TradesList = uniswapV2AllowedPairsList
      .filter(pairs => pairs.length > 0 && pairs[0].platform.supportsChain(chainId))
      .map(async pairs => {
        return (
          UniswapV2Trade.bestTradeExactIn({
            currencyAmountIn,
            currencyOut,
            maximumSlippage: new Percent('3', '100'),
            pairs,
            maxHops: {
              maxHops: uniswapV2IsMultihop ? 3 : 1,
              maxNumResults: 1
            }
          }) ?? undefined
        )
      })

    const curveTrade = new Promise<CurveTrade | undefined>(async resolve => {
      CurveTrade.bestTradeExactIn({
        currencyAmountIn,
        currencyOut,
        maximumSlippage: new Percent('3', '100')
      })
        .then(resolve)
        .catch(error => {
          // The next step does not care about the error. Promise.all
          // is all or nothing. Hence, this Promise must solve as undefined
          resolve(undefined)
          console.log(error)
        })
    })

    const allNewTrades = Promise.all([...(uniswapV2TradesList as any), curveTrade])

    allNewTrades
      .then(trades => trades.filter(trade => trade !== undefined))
      .then(newTrades => {
        // add deep comparsion
        if (!isCancelled) {
          setTrades(newTrades)
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false))

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line
  }, [
    chainId,
    uniswapV2IsMultihop,
    uniswapV2AllowedPairsList.length,
    // eslint-disable-next-line
    currencyAmountIn?.toSignificant(),
    currencyInAndOutAdddress
  ])

  return {
    loading,
    trades: sortTradesByExecutionPrice(trades)
  }
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 * for each supported platform. Order is by lowest price ascending.
 */
export function useTradeExactOutAllPlatforms(
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount
): UseTradeExactAllPlatformsResult {
  const [loading, setLoading] = useState(true)
  // All trades including Curve, Unsiwap V2 and CowSwap
  const [trades, setTrades] = useState<Trade[]>([])
  // Chain Id
  const { chainId } = useActiveWeb3React()
  // Uniswap V2 Trade option: using multi-hop option
  const uniswapV2IsMultihop = useIsMultihop()
  // List of Uniswap V2 pairs per platform
  const uniswapV2AllowedPairsList = [
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.SWAPR),
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.UNISWAP),
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.SUSHISWAP),
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.HONEYSWAP),
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.BAOSWAP),
    useAllCommonPairs(currencyIn, currencyAmountOut?.currency, UniswapV2RoutablePlatform.LEVINSWAP)
  ].filter(platformPairs => platformPairs.length !== 0)

  // Used to trigger computing trade route
  const currencyInAndOutAdddress = `${currencyIn?.address}-${currencyAmountOut?.currency.address}`

  useEffect(() => {
    let isCancelled = false

    // Early exit and clean state if necessary
    if (!currencyAmountOut || !currencyIn || !chainId) {
      // setBesTrades([])
      setLoading(false)
      return
    }

    setLoading(true)

    console.log('useTradeExactOutAllPlatforms: Computing trades from UniswapV2 and Curve')

    // Calculate trade output from: Uniswap V2 and its forks, Curve

    // Promisify the Uniswap trade list
    const uniswapV2TradesList = uniswapV2AllowedPairsList
      .filter(pairs => pairs.length > 0 && pairs[0].platform.supportsChain(chainId))
      .map(async pairs => {
        return (
          UniswapV2Trade.bestTradeExactOut({
            currencyIn,
            currencyAmountOut,
            maximumSlippage: new Percent('3', '100'),
            pairs,
            maxHops: {
              maxHops: uniswapV2IsMultihop ? 3 : 1,
              maxNumResults: 1
            }
          }) ?? undefined
        )
      })

    const curveTrade = new Promise<CurveTrade | undefined>(async resolve => {
      CurveTrade.bestTradeExactOut({
        currencyAmountOut,
        currencyIn,
        maximumSlippage: new Percent('3', '100')
      })
        .then(resolve)
        .catch(error => {
          // The next step does not care about the error. Promise.all
          // is all or nothing. Hence, this Promise must solve as undefined
          resolve(undefined)
          console.log(error)
        })
    })

    const allNewTrades = Promise.all([...(uniswapV2TradesList as any), curveTrade])

    allNewTrades
      .then(trades => trades.filter(trade => trade !== undefined))
      .then(newTrades => {
        // add deep comparsion
        if (!isCancelled) {
          setTrades(newTrades)
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false))

    return () => {
      isCancelled = true
    }
    // eslint-disable-next-line
  }, [
    chainId,
    uniswapV2IsMultihop,
    // eslint-disable-next-line
    uniswapV2AllowedPairsList.length,
    // eslint-disable-next-line
    currencyAmountOut?.toSignificant(),
    currencyInAndOutAdddress
  ])

  return {
    loading,
    trades: sortTradesByExecutionPrice(trades)
  }
}
