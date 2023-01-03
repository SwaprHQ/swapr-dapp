import { Pair, RoutablePlatform, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { BaseAppState } from '../adapters/baseAdapter/base.adapter'
import { AllTradesAndLiquidityFromAdapters, BasePair, LiquidityTypename } from '../adapters/baseAdapter/base.types'
import { UniswapV3Pair } from '../adapters/uniswapV3/uniswapV3.types'
import { AdapterKey, AdvancedViewTransaction } from '../advancedTradingView.types'

const adapterLogos: { [key in AdapterKey]: string } = {
  swapr: UniswapV2RoutablePlatform.SWAPR.name,
  sushiswap: UniswapV2RoutablePlatform.SUSHISWAP.name,
  uniswapV2: UniswapV2RoutablePlatform.UNISWAP.name,
  honeyswap: UniswapV2RoutablePlatform.HONEYSWAP.name,
  uniswapV3: RoutablePlatform.UNISWAP.name,
}

const formatAdapterAmount = (amount: Number) => {
  if (amount < 0.000001) return amount.toFixed(4)

  if (amount < 0.001) return amount.toFixed(6)

  return amount.toFixed(4)
}

export const sortsBeforeTokens = (inputToken: Token, outputToken: Token) => {
  try {
    return inputToken.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]
  } catch {
    return [inputToken, outputToken]
  }
}

const getAdapterPair = <T extends BaseAppState>(key: AdapterKey, platform: UniswapV2RoutablePlatform) =>
  createSelector(
    [(state: T) => state.advancedTradingView.pair, (state: T) => state.advancedTradingView.adapters[key]],
    ({ inputToken, outputToken }, adapterPairs) => {
      if (inputToken && outputToken) {
        try {
          const pairId = Pair.getAddress(inputToken, outputToken, platform).toLowerCase()
          return {
            pair: adapterPairs[pairId] as BasePair,
            logoKey: adapterLogos[key],
          }
        } catch {}
      }
    }
  )
const getAdapterPairUniswapV3 = <T extends BaseAppState>(key: AdapterKey) =>
  createSelector(
    [(state: T) => state.advancedTradingView.pair, (state: T) => state.advancedTradingView.adapters[key]],
    ({ inputToken, outputToken }, adapterPairs) => {
      if (inputToken && outputToken) {
        const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

        try {
          const pairId = `${token0.address}-${token1.address}`

          return {
            pair: adapterPairs[pairId] as UniswapV3Pair,
            logoKey: adapterLogos[key],
          }
        } catch {}
      }
    }
  )

export const selectCurrentSwaprPair = getAdapterPair(AdapterKey.SWAPR, UniswapV2RoutablePlatform.SWAPR)
const selectCurrentSushiPair = getAdapterPair(AdapterKey.SUSHISWAP, UniswapV2RoutablePlatform.SUSHISWAP)
const selectCurrentUniswapV2Pair = getAdapterPair(AdapterKey.UNISWAPV2, UniswapV2RoutablePlatform.UNISWAP)
const selectCurrentHoneyPair = getAdapterPair(AdapterKey.HONEYSWAP, UniswapV2RoutablePlatform.HONEYSWAP)
const selectCurrentUniswapV3Pair = getAdapterPairUniswapV3(AdapterKey.UNISWAPV3)

const selectAllCurrentPairs = createSelector(
  [selectCurrentSwaprPair, selectCurrentSushiPair, selectCurrentUniswapV2Pair, selectCurrentHoneyPair],
  (...pairs) =>
    pairs.reduce<AllTradesAndLiquidityFromAdapters>(
      (dataFromAllAdapters, adapterPair) => {
        if (adapterPair?.pair?.swaps) {
          // @ts-ignore
          dataFromAllAdapters.swaps = [
            ...dataFromAllAdapters.swaps,
            ...adapterPair.pair.swaps.data.map(tx => ({ ...tx, logoKey: adapterPair.logoKey })),
          ]
        }

        if (adapterPair?.pair?.burnsAndMints) {
          dataFromAllAdapters.burnsAndMints = [
            ...dataFromAllAdapters.burnsAndMints,
            ...adapterPair.pair.burnsAndMints.data.map(tx => ({ ...tx, logoKey: adapterPair.logoKey })),
          ]
        }

        return dataFromAllAdapters
      },
      { swaps: [], burnsAndMints: [] }
    )
)

export const selectHasMoreData = createSelector(
  [
    selectCurrentSwaprPair,
    selectCurrentSushiPair,
    selectCurrentUniswapV2Pair,
    selectCurrentHoneyPair,
    selectCurrentUniswapV3Pair,
  ],
  (...pairs) => ({
    hasMoreTrades: pairs.map(pair => Boolean(pair?.pair?.swaps?.hasMore)).some(hasMore => hasMore),
    hasMoreActivity: pairs.map(pair => Boolean(pair?.pair?.burnsAndMints?.hasMore)).some(hasMore => hasMore),
  })
)

export const selectAllDataFromAdapters = createSelector(
  [selectAllCurrentPairs, (state: AppState) => state.advancedTradingView.pair],
  (pair, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken || !pair)
      return {
        baseAdapterTradeHistory: [],
        baseAdapterLiquidityHistory: [],
      }

    const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

    const { burnsAndMints, swaps } = pair

    const baseAdapterLiquidityHistory: AdvancedViewTransaction[] = burnsAndMints.map(
      ({ transaction: { id }, amount0, amount1, timestamp, amountUSD, logoKey, type }) => {
        return {
          transactionId: id,
          amountIn: formatAdapterAmount(Number(amount0)),
          amountOut: formatAdapterAmount(Number(amount1)),
          timestamp,
          logoKey,
          amountUSD,
          isSell: type === LiquidityTypename.BURN,
        }
      }
    )
    const baseAdapterTradeHistory: Required<AdvancedViewTransaction>[] = swaps.map(
      ({ amount0In, amount0Out, amount1In, amount1Out, transaction: { id }, timestamp, amountUSD, logoKey }) => {
        const normalizedValues = {
          amount0In: Number(amount0In),
          amount0Out: Number(amount0Out),
          amount1In: Number(amount1In),
          amount1Out: Number(amount1Out),
          token0Address: token0.address.toLowerCase(),
          token1Address: token1.address.toLowerCase(),
          inputTokenAddress: inputToken.address.toLowerCase(),
          outputTokenAddress: outputToken.address.toLowerCase(),
        }

        const amount0 = Math.max(normalizedValues.amount0In, normalizedValues.amount0Out)
        const amount1 = Math.max(normalizedValues.amount1In, normalizedValues.amount1Out)

        return {
          transactionId: id,
          amountIn: formatAdapterAmount(
            normalizedValues.inputTokenAddress === normalizedValues.token0Address ? amount0 : amount1
          ),
          amountOut: formatAdapterAmount(
            normalizedValues.outputTokenAddress === normalizedValues.token0Address ? amount0 : amount1
          ),
          priceToken0: isFinite(Number(formatAdapterAmount(amount1 / amount0)))
            ? formatAdapterAmount(amount1 / amount0)
            : '-',
          priceToken1: isFinite(Number(formatAdapterAmount(amount0 / amount1)))
            ? formatAdapterAmount(amount0 / amount1)
            : '-',
          timestamp,
          amountUSD,
          isSell:
            (normalizedValues.token0Address === normalizedValues.inputTokenAddress &&
              normalizedValues.amount0In > normalizedValues.amount1In) ||
            (normalizedValues.token1Address === normalizedValues.inputTokenAddress &&
              normalizedValues.amount1In > normalizedValues.amount0In),
          logoKey,
        }
      }
    )
    return {
      baseAdapterTradeHistory,
      baseAdapterLiquidityHistory,
    }
  }
)

export const selectUniswapV3AllData = createSelector(
  [selectCurrentUniswapV3Pair, (state: AppState) => state.advancedTradingView.pair],
  (uniswapV3Pair, { inputToken, outputToken }) => {
    if (!inputToken || !outputToken || !uniswapV3Pair)
      return {
        uniswapV3TradeHistory: [],
        uniswapV3LiquidityHistory: [],
      }

    const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)

    const { pair, logoKey } = uniswapV3Pair

    const uniswapV3LiquidityHistory: AdvancedViewTransaction[] = pair?.burnsAndMints
      ? pair.burnsAndMints.data.map(({ transaction: { id }, amount0, amount1, timestamp, type, amountUSD }) => {
          return {
            transactionId: id,
            amountIn: formatAdapterAmount(Number(amount0)),
            amountOut: formatAdapterAmount(Number(amount1)),
            timestamp,
            logoKey,
            amountUSD,
            isSell: type === LiquidityTypename.BURN,
          }
        })
      : []

    const uniswapV3TradeHistory: Required<AdvancedViewTransaction>[] = pair?.swaps
      ? pair.swaps.data.map(trade => {
          const {
            amount0,
            amount1,
            transaction: { id },
            timestamp,
            amountUSD,
          } = trade
          const normalizedValues = {
            amount0: Number(amount0),
            amount1: Number(amount1),
            token0Address: token0.address.toLowerCase(),
            token1Address: token1.address.toLowerCase(),
            inputTokenAddress: inputToken.address.toLowerCase(),
            outputTokenAddress: outputToken.address.toLowerCase(),
          }

          // UniswapV3 returns one amount negative
          const absoluteAmount0 = Math.abs(normalizedValues.amount0)
          const absoluteAmount1 = Math.abs(normalizedValues.amount1)
          const isSell =
            (normalizedValues.token0Address === normalizedValues.inputTokenAddress && normalizedValues.amount0 < 0) ||
            (normalizedValues.token1Address === normalizedValues.inputTokenAddress && normalizedValues.amount1 < 0)
          return {
            transactionId: id,
            amountIn: formatAdapterAmount(
              normalizedValues.token0Address === normalizedValues.inputTokenAddress ? absoluteAmount0 : absoluteAmount1
            ),
            amountOut: formatAdapterAmount(
              normalizedValues.token0Address === normalizedValues.outputTokenAddress ? absoluteAmount0 : absoluteAmount1
            ),
            priceToken0: formatAdapterAmount(absoluteAmount1 / absoluteAmount0),
            priceToken1: formatAdapterAmount(absoluteAmount0 / absoluteAmount1),
            timestamp,
            amountUSD,
            isSell,
            logoKey,
          }
        })
      : []

    return {
      uniswapV3TradeHistory,
      uniswapV3LiquidityHistory,
    }
  }
)
