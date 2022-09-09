import { ChainId, Pair, Token, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { actions, initialState as advancedTradingViewInitialState } from '../../advancedTradingView.reducer'
import {
  AdapterFetchDetails,
  AdapterInitialArguments,
  AdapterKeys,
  AdapterPayloadType,
} from '../../advancedTradingView.types'
import { AbstractAdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { PAIR_BURNS_AND_MINTS, PAIR_SWAPS } from './base.queries'
import { PairBurnsAndMints, PairSwaps } from './base.types'

export interface BaseAppState {
  advancedTradingView: typeof advancedTradingViewInitialState
}

export class BaseAdapter<AppState extends BaseAppState> extends AbstractAdvancedTradingViewAdapter<AppState> {
  private _key: AdapterKeys
  private _adapterSupportedChains: ChainId[]
  private _platform: UniswapV2RoutablePlatform
  private _subgraphUrls: {
    [ChainId.GNOSIS]: string
    [ChainId.MAINNET]: string
    [ChainId.ARBITRUM_ONE]: string
  }

  constructor({
    key,
    adapterSupportedChains,
    platform,
    subgraphUrls,
  }: {
    key: AdapterKeys
    adapterSupportedChains: ChainId[]
    platform: UniswapV2RoutablePlatform
    subgraphUrls: {
      [ChainId.GNOSIS]: string
      [ChainId.MAINNET]: string
      [ChainId.ARBITRUM_ONE]: string
    }
  }) {
    super()

    this._key = key
    this._platform = platform
    this._subgraphUrls = subgraphUrls
    this._adapterSupportedChains = adapterSupportedChains
  }

  public updateActiveChainId(chainId: ChainId) {
    this._chainId = chainId
  }

  public setInitialArguments({ chainId, store }: AdapterInitialArguments<AppState>) {
    this._chainId = chainId
    this._store = store
  }

  public async getPairTrades({
    inputToken,
    outputToken,
    amountToFetch,
    isFirstFetch,
    abortController,
  }: AdapterFetchDetails) {
    if (!this._isSupportedChainId(this._chainId)) return

    const subgraphPairId = this._getSubgraphPairId(inputToken, outputToken)

    if (!subgraphPairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][subgraphPairId]

    if ((pair && !isFirstFetch && !pair.swaps?.hasMore) || (pair && isFirstFetch)) return

    try {
      const { swaps } = await request<PairSwaps>({
        url: this._subgraphUrls[this._chainId],
        document: PAIR_SWAPS,
        variables: {
          pairId: subgraphPairId,
          first: amountToFetch,
          skip: pair?.swaps?.data.length ?? 0,
        },
        signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
      })

      const hasMore = swaps.length === amountToFetch

      this.store.dispatch(
        this.actions.setPairData({
          key: this._key,
          pairId: subgraphPairId,
          payloadType: AdapterPayloadType.swaps,
          data: swaps,
          hasMore,
        })
      )
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

    const subgraphPairId = this._getSubgraphPairId(inputToken, outputToken)

    if (!subgraphPairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][subgraphPairId]

    if ((pair && !isFirstFetch && !pair.burnsAndMints?.hasMore) || (pair && isFirstFetch)) return

    try {
      const { burns, mints } = await request<PairBurnsAndMints>({
        url: this._subgraphUrls[this._chainId],
        document: PAIR_BURNS_AND_MINTS,
        variables: {
          pairId: subgraphPairId,
          first: amountToFetch,
          skip: pair?.burnsAndMints?.data.length ?? 0,
        },
        signal: abortController(`${this._key}-pair-activity`) as RequestOptions['signal'],
      })

      const hasMore = Boolean(burns.length === amountToFetch || mints.length === amountToFetch)

      this.store.dispatch(
        this.actions.setPairData({
          key: this._key,
          pairId: subgraphPairId,
          payloadType: AdapterPayloadType.burnsAndMints,
          data: [...burns, ...mints],
          hasMore,
        })
      )
    } catch (e) {
      console.warn(`${this._key}${e}`)
    }
  }

  private get actions() {
    return actions
  }

  private get store() {
    if (!this._store) throw new Error('No store set')

    return this._store
  }

  private _getSubgraphPairId(inputToken: Token, outputToken: Token) {
    try {
      return Pair.getAddress(inputToken, outputToken, this._platform).toLowerCase()
    } catch {}
  }

  private _isSupportedChainId(chainId?: ChainId): chainId is ChainId.MAINNET | ChainId.GNOSIS | ChainId.ARBITRUM_ONE {
    if (!chainId) return false

    return this._adapterSupportedChains.includes(chainId)
  }
}
