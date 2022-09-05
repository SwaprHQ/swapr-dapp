import { Pair, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { createSelector } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AllTradesAndLiquidityFromAdapters } from './adapters/baseAdapter/base.types'
import { AdapterKeys, AdvancedViewTransaction } from './advancedTradingView.types'

const adapterLogos: { [key in AdapterKeys]: string } = {
  swapr: UniswapV2RoutablePlatform.SWAPR.name,
  sushiswap: UniswapV2RoutablePlatform.SUSHISWAP.name,
  uniswapV2: UniswapV2RoutablePlatform.UNISWAP.name,
  honeyswap: UniswapV2RoutablePlatform.HONEYSWAP.name,
}

export const sortsBeforeTokens = (inputToken: Token, outputToken: Token) =>
  inputToken.sortsBefore(outputToken) ? [inputToken, outputToken] : [outputToken, inputToken]

const getAdapterPair = (key: AdapterKeys, platform: UniswapV2RoutablePlatform) =>
  createSelector(
    [(state: AppState) => state.advancedTradingView.pair, (state: AppState) => state.advancedTradingView.adapters[key]],
    ({ inputToken, outputToken }, adapterPairs) => {
      if (inputToken && outputToken) {
        try {
          const pairId = Pair.getAddress(inputToken, outputToken, platform).toLowerCase()
          return {
            pair: adapterPairs[pairId],
            logoKey: adapterLogos[key],
          }
        } catch {}
      }
    }
  )

const selectCurrentSwaprPair = getAdapterPair(AdapterKeys.SWAPR, UniswapV2RoutablePlatform.SWAPR)
const selectCurrentSushiPair = getAdapterPair(AdapterKeys.SUSHISWAP, UniswapV2RoutablePlatform.SUSHISWAP)
const selectCurrentUniswapV2Pair = getAdapterPair(AdapterKeys.UNISWAPV2, UniswapV2RoutablePlatform.UNISWAP)
const selectCurrentHoneyPair = getAdapterPair(AdapterKeys.HONEYSWAP, UniswapV2RoutablePlatform.HONEYSWAP)

const selectAllCurrentPairs = createSelector(
  [selectCurrentSwaprPair, selectCurrentSushiPair, selectCurrentUniswapV2Pair, selectCurrentHoneyPair],
  (...pairs) =>
    pairs.reduce<AllTradesAndLiquidityFromAdapters>(
      (dataFromAllAdapters, adapterPair) => {
        if (adapterPair?.pair?.swaps) {
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

const identity = (x: boolean) => x

export const selectHasMoreData = createSelector(
  [selectCurrentSwaprPair, selectCurrentSushiPair, selectCurrentUniswapV2Pair, selectCurrentHoneyPair],
  (...pairs) => ({
    hasMoreTrades: pairs.map(pair => pair?.pair?.swaps?.hasMore ?? true).some(identity),
    hasMoreActivity: pairs.map(pair => pair?.pair?.burnsAndMints?.hasMore ?? true).some(identity),
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

    const baseAdapterLiquidityHistory: AdvancedViewTransaction[] = burnsAndMints.map(trade => {
      const {
        transaction: { id },
        amount0,
        amount1,
        timestamp,
        logoKey,
      } = trade
      return {
        transactionId: id,
        amountIn: `${amount0} ${token0.symbol}`,
        amountOut: `${amount1} ${token1.symbol}`,
        timestamp,
        logoKey,
      }
    })
    const baseAdapterTradeHistory: Required<AdvancedViewTransaction>[] = swaps.map(trade => {
      const {
        amount0In,
        amount0Out,
        amount1In,
        amount1Out,
        transaction: { id },
        timestamp,
        amountUSD,
        logoKey,
      } = trade
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
        amountIn: (normalizedValues.inputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        amountOut: (normalizedValues.outputTokenAddress === normalizedValues.token0Address
          ? amount0
          : amount1
        ).toString(),
        priceToken0: (amount1 / amount0).toString(),
        priceToken1: (amount0 / amount1).toString(),
        timestamp,
        amountUSD,
        isSell:
          (normalizedValues.token0Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount0In > normalizedValues.amount1In) ||
          (normalizedValues.token1Address === normalizedValues.inputTokenAddress &&
            normalizedValues.amount1In > normalizedValues.amount0In),
        logoKey,
      }
    })
    return {
      baseAdapterTradeHistory,
      baseAdapterLiquidityHistory,
    }
  }
)
