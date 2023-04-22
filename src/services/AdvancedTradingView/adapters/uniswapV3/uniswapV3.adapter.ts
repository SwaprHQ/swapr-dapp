import { Token } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { AdapterFetchMethodArguments } from '../../advancedTradingView.types'
import { sortsBeforeTokens } from '../../store/advancedTradingView.selectors'
import { BaseAdapter, BaseAppState } from '../baseAdapter/base.adapter'

import {
  UNISWAP_PAIR_BURNS_AND_MINTS,
  UNISWAP_PAIR_SWAPS,
  UNISWAP_PAIR_SWAPS_BURNS_AND_MINTS,
} from './uniswapV3.queries'

export class UniswapV3Adapter<
  AppState extends BaseAppState,
  GenericPairSwapsBurnsAndMints extends { swaps: unknown[]; burns: unknown[]; mints: unknown[] },
  GenericPairSwaps extends { swaps: unknown[] },
  GenericPairBurnsAndMints extends { burns: unknown[]; mints: unknown[] }
> extends BaseAdapter<AppState, GenericPairSwapsBurnsAndMints, GenericPairSwaps, GenericPairBurnsAndMints> {
  protected async _fetchSwapsBurnsAndMints({
    abortController,
    amountToFetch,
    chainId,
    inputTokenAddress,
    outputTokenAddress,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairSwapsBurnsAndMints>({
      url: this._subgraphUrls[chainId],
      document: UNISWAP_PAIR_SWAPS_BURNS_AND_MINTS,
      variables: {
        token0_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        token1_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        first: amountToFetch,
      },
      signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
    })
  }

  protected async _fetchSwaps({
    abortController,
    amountToFetch,
    chainId,
    inputTokenAddress,
    outputTokenAddress,
    pair,
    refreshing,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairSwaps>({
      url: this._subgraphUrls[chainId],
      document: UNISWAP_PAIR_SWAPS,
      variables: {
        token0_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        token1_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        first: amountToFetch,
        skip: refreshing ? 0 : pair?.swaps?.data.length ?? 0,
      },
      signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
    })
  }

  protected async _fetchBurnsAndMints({
    pair,
    chainId,
    amountToFetch,
    abortController,
    inputTokenAddress,
    outputTokenAddress,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairBurnsAndMints>({
      url: this._subgraphUrls[chainId],
      document: UNISWAP_PAIR_BURNS_AND_MINTS,
      variables: {
        token0_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        token1_in: [inputTokenAddress.toLowerCase(), outputTokenAddress.toLowerCase()],
        first: amountToFetch,
        skip: pair?.burnsAndMints?.data.length ?? 0,
      },
      signal: abortController(`${this._key}-pair-activity`) as RequestOptions['signal'],
    })
  }

  protected _getPairId(inputToken: Token, outputToken: Token) {
    try {
      const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)
      return `${token0.address}-${token1.address}`
    } catch {}
  }
}
