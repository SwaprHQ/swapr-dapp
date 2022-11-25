import { ChainId, Pair, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import {
  AdapterFetchDetails,
  AdapterFetchDetailsExtended,
  AdapterFetchMethodArguments,
  AdapterKey,
  AdapterPayloadType,
} from '../../advancedTradingView.types'
import { initialState as advancedTradingViewInitialState } from '../../store/advancedTradingView.reducer'
import { AbstractAdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { PAIR_BURNS_AND_MINTS, PAIR_SWAPS, PAIR_SWAPS_BURNS_AND_MINTS } from './base.queries'

export interface BaseAppState {
  advancedTradingView: typeof advancedTradingViewInitialState
}

export class BaseAdapter<
  AppState extends BaseAppState,
  GenericPairSwapsBurnsAndMints extends { swaps: unknown[]; burns: unknown[]; mints: unknown[] },
  GenericPairSwaps extends { swaps: unknown[] },
  GenericPairBurnsAndMints extends { burns: unknown[]; mints: unknown[] }
> extends AbstractAdvancedTradingViewAdapter<AppState> {
  protected _platform: UniswapV2RoutablePlatform | undefined
  protected _subgraphUrls: {
    [ChainId.GNOSIS]: string
    [ChainId.MAINNET]: string
    [ChainId.ARBITRUM_ONE]: string
    [ChainId.POLYGON]: string
    [ChainId.OPTIMISM_MAINNET]: string
  }

  constructor({
    key,
    platform,
    subgraphUrls,
    adapterSupportedChains,
  }: {
    key: AdapterKey
    platform?: UniswapV2RoutablePlatform
    subgraphUrls: {
      [ChainId.GNOSIS]: string
      [ChainId.MAINNET]: string
      [ChainId.ARBITRUM_ONE]: string
      [ChainId.POLYGON]: string
      [ChainId.OPTIMISM_MAINNET]: string
    }
    adapterSupportedChains: ChainId[]
  }) {
    super({ adapterSupportedChains, key })

    this._platform = platform
    this._subgraphUrls = subgraphUrls
  }

  public async getPairTradingAndActivityData({
    inputToken,
    outputToken,
    amountToFetch,
    abortController,
    refreshing,
  }: AdapterFetchDetails) {
    if (!this.isSupportedChainId(this._chainId)) return

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    try {
      const { swaps, burns, mints } = await this._fetchSwapsBurnsAndMints({
        pairId,
        pair,
        chainId: this._chainId,
        amountToFetch,
        abortController,
        refreshing,
        inputTokenAddress: inputToken.address,
        outputTokenAddress: outputToken.address,
      })

      return {
        key: this._key,
        pairId,
        data: {
          swaps,
          burnsAndMints: [...burns, ...mints],
        },
        hasMore: Boolean(
          swaps.length === amountToFetch || burns.length === amountToFetch || mints.length === amountToFetch
        ),
      }
    } catch (e) {
      console.warn(`${this._key}${e}`)
      return
    }
  }

  public async getPairData({
    payloadType,
    inputToken,
    outputToken,
    amountToFetch,
    abortController,
    refreshing,
  }: AdapterFetchDetailsExtended) {
    if (!this.isSupportedChainId(this._chainId)) return

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    try {
      if (payloadType === AdapterPayloadType.SWAPS) {
        const { swaps } = await this._fetchSwaps({
          pairId,
          pair,
          chainId: this._chainId,
          amountToFetch,
          abortController,
          refreshing,
          inputTokenAddress: inputToken.address,
          outputTokenAddress: outputToken.address,
        })

        return {
          payloadType: AdapterPayloadType.SWAPS,
          key: this._key,
          pairId,
          data: swaps,
          hasMore: swaps.length === amountToFetch,
        }
      }

      if (payloadType === AdapterPayloadType.BURNS_AND_MINTS) {
        const { burns, mints } = await this._fetchBurnsAndMints({
          pairId,
          pair,
          chainId: this._chainId,
          amountToFetch,
          abortController,
          refreshing,
          inputTokenAddress: inputToken.address,
          outputTokenAddress: outputToken.address,
        })

        return {
          payloadType: AdapterPayloadType.BURNS_AND_MINTS,
          key: this._key,
          pairId,
          data: [...burns, ...mints],
          hasMore: Boolean(burns.length === amountToFetch || mints.length === amountToFetch),
        }
      }
    } catch (e) {
      return console.warn(`${this._key}${e}`)
    }
  }

  protected _getPairId(inputToken: Token, outputToken: Token) {
    try {
      return Pair.getAddress(inputToken, outputToken, this._platform).toLowerCase()
    } catch {}
  }

  protected async _fetchSwapsBurnsAndMints({
    pairId,
    chainId,
    amountToFetch,
    abortController,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairSwapsBurnsAndMints>({
      url: this._subgraphUrls[chainId],
      document: PAIR_SWAPS_BURNS_AND_MINTS,
      variables: {
        pairId,
        first: amountToFetch,
      },
      signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
    })
  }

  protected async _fetchSwaps({
    pairId,
    pair,
    chainId,
    amountToFetch,
    abortController,
    refreshing,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairSwaps>({
      url: this._subgraphUrls[chainId],
      document: PAIR_SWAPS,
      variables: {
        pairId,
        first: amountToFetch,
        skip: refreshing ? 0 : pair?.swaps?.data.length ?? 0,
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
    refreshing,
  }: AdapterFetchMethodArguments) {
    return await request<GenericPairBurnsAndMints>({
      url: this._subgraphUrls[chainId],
      document: PAIR_BURNS_AND_MINTS,
      variables: {
        pairId,
        first: amountToFetch,
        skip: refreshing ? 0 : pair?.swaps?.data.length ?? 0,
      },
      signal: abortController(`${this._key}-pair-activity`) as RequestOptions['signal'],
    })
  }
}
