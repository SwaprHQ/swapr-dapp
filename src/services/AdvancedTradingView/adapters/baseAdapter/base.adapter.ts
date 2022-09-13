import { ChainId, Pair, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { initialState as advancedTradingViewInitialState } from '../../advancedTradingView.reducer'
import {
  AdapterFetchDetails,
  AdapterFetchMethodArguments,
  AdapterKeys,
  AdapterPayloadType,
} from '../../advancedTradingView.types'
import { AbstractAdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { PAIR_BURNS_AND_MINTS, PAIR_SWAPS } from './base.queries'

export interface BaseAppState {
  advancedTradingView: typeof advancedTradingViewInitialState
}

export class BaseAdapter<
  AppState extends BaseAppState,
  GenericPairSwaps extends { swaps: unknown[] },
  GenericPairBurnsAndMints extends { burns: unknown[]; mints: unknown[] }
> extends AbstractAdvancedTradingViewAdapter<AppState> {
  protected _platform: UniswapV2RoutablePlatform | undefined
  protected _subgraphUrls: {
    [ChainId.GNOSIS]: string
    [ChainId.MAINNET]: string
    [ChainId.ARBITRUM_ONE]: string
  }

  constructor({
    key,
    platform,
    subgraphUrls,
    adapterSupportedChains,
  }: {
    key: AdapterKeys
    platform?: UniswapV2RoutablePlatform
    subgraphUrls: {
      [ChainId.GNOSIS]: string
      [ChainId.MAINNET]: string
      [ChainId.ARBITRUM_ONE]: string
    }
    adapterSupportedChains: ChainId[]
  }) {
    super({ adapterSupportedChains, key })

    this._platform = platform
    this._subgraphUrls = subgraphUrls
  }

  public async getPairTrades({
    inputToken,
    outputToken,
    amountToFetch,
    isFirstFetch,
    abortController,
  }: AdapterFetchDetails) {
    if (!this._isSupportedChainId(this._chainId)) return

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    if ((pair && !isFirstFetch && !pair.swaps?.hasMore) || (pair && isFirstFetch)) return

    try {
      const swaps = await this._fetchSwaps({
        pairId,
        pair,
        chainId: this._chainId,
        amountToFetch,
        abortController,
        inputTokenAddress: inputToken.address,
        outputTokenAddress: outputToken.address,
      })

      this._dispatchSwaps(pairId, swaps, amountToFetch)
    } catch (e) {
      console.warn(`${this._key}${e}`)
    }
  }

  public async getPairActivity({
    inputToken,
    outputToken,
    amountToFetch,
    isFirstFetch,
    abortController,
  }: AdapterFetchDetails) {
    if (!this._isSupportedChainId(this._chainId)) return

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    if ((pair && !isFirstFetch && !pair.burnsAndMints?.hasMore) || (pair && isFirstFetch)) return

    try {
      const burnsAndMints = await this._fetchBurnsAndMints({
        pairId,
        pair,
        chainId: this._chainId,
        amountToFetch,
        abortController,
        inputTokenAddress: inputToken.address,
        outputTokenAddress: outputToken.address,
      })

      this._dispatchBurnsAndMints(pairId, burnsAndMints, amountToFetch)
    } catch (e) {
      console.warn(`${this._key}${e}`)
    }
  }

  protected _getPairId(inputToken: Token, outputToken: Token) {
    try {
      return Pair.getAddress(inputToken, outputToken, this._platform).toLowerCase()
    } catch {}
  }

  protected async _fetchSwaps({ pairId, pair, chainId, amountToFetch, abortController }: AdapterFetchMethodArguments) {
    return await request<GenericPairSwaps>({
      url: this._subgraphUrls[chainId],
      document: PAIR_SWAPS,
      variables: {
        pairId,
        first: amountToFetch,
        skip: pair?.swaps?.data.length ?? 0,
      },
      signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
    })
  }

  protected async _fetchBurnsAndMints({
    pairId,
    pair,
    chainId,
    amountToFetch,
    abortController,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairBurnsAndMints>({
      url: this._subgraphUrls[chainId],
      document: PAIR_BURNS_AND_MINTS,
      variables: {
        pairId,
        first: amountToFetch,
        skip: pair?.burnsAndMints?.data.length ?? 0,
      },
      signal: abortController(`${this._key}-pair-activity`) as RequestOptions['signal'],
    })
  }

  protected _dispatchSwaps(pairId: string, { swaps }: GenericPairSwaps, amountToFetch: number) {
    const hasMore = swaps.length === amountToFetch

    this.store.dispatch(
      this.actions.setPairData({
        key: this._key,
        pairId,
        payloadType: AdapterPayloadType.swaps,
        data: swaps,
        hasMore,
      })
    )
  }

  protected _dispatchBurnsAndMints(pairId: string, { burns, mints }: GenericPairBurnsAndMints, amountToFetch: number) {
    const hasMore = Boolean(burns.length === amountToFetch || mints.length === amountToFetch)

    this.store.dispatch(
      this.actions.setPairData({
        key: this._key,
        pairId,
        payloadType: AdapterPayloadType.burnsAndMints,
        data: [...burns, ...mints],
        hasMore,
      })
    )
  }
}
