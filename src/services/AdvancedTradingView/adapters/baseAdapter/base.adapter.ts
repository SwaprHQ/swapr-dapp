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

  public async getPairTrades({
    inputToken,
    outputToken,
    amountToFetch,
    isFirstFetch,
    abortController,
  }: AdapterFetchDetails) {
    if (!this.isSupportedChainId(this._chainId)) return

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
    if (!this.isSupportedChainId(this._chainId)) return

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

  public async getPairData({
    dataType,
    inputToken,
    outputToken,
    amountToFetch,
    isFirstFetch,
    abortController,
  }: AdapterFetchDetailsExtended) {
    if (!this.isSupportedChainId(this._chainId)) return

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    if (
      (dataType === AdapterPayloadType.SWAPS && pair && !isFirstFetch && !pair.swaps?.hasMore) ||
      (dataType === AdapterPayloadType.SWAPS && pair && isFirstFetch) ||
      (dataType === AdapterPayloadType.BURNS_AND_MINTS && pair && !isFirstFetch && !pair.burnsAndMints?.hasMore) ||
      (dataType === AdapterPayloadType.BURNS_AND_MINTS && pair && isFirstFetch)
    )
      return

    try {
      if (dataType === AdapterPayloadType.SWAPS) {
        const { swaps } = await this._fetchSwaps({
          pairId,
          pair,
          chainId: this._chainId,
          amountToFetch,
          abortController,
          inputTokenAddress: inputToken.address,
          outputTokenAddress: outputToken.address,
        })

        return {
          key: this._key,
          pairId,
          data: swaps,
          hasMore: swaps.length === amountToFetch,
        }
      }

      if (dataType === AdapterPayloadType.BURNS_AND_MINTS) {
        const { burns, mints } = await this._fetchBurnsAndMints({
          pairId,
          pair,
          chainId: this._chainId,
          amountToFetch,
          abortController,
          inputTokenAddress: inputToken.address,
          outputTokenAddress: outputToken.address,
        })

        return {
          key: this._key,
          pairId,
          data: [...burns, ...mints],
          hasMore: Boolean(burns.length === amountToFetch || mints.length === amountToFetch),
        }
      }
    } catch (e) {
      console.warn(`${this._key}${e}`)
      return
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
        payloadType: AdapterPayloadType.SWAPS,
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
        payloadType: AdapterPayloadType.BURNS_AND_MINTS,
        data: [...burns, ...mints],
        hasMore,
      })
    )
  }
}
