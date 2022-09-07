import { ChainId, RoutablePlatform, Token } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { actions } from '../../advancedTradingView.reducer'
import { sortsBeforeTokens } from '../../advancedTradingView.selectors'
import {
  AdapterFetchDetails,
  AdapterInitialArguments,
  AdapterKeys,
  AdapterPayloadType,
} from '../../advancedTradingView.types'
import { AbstractAdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { UNISWAP_PAIR_BURNS_AND_MINTS, UNISWAP_PAIR_SWAPS } from './uniswapV3.queries'
import { UniswapV3PairBurnsAndMints, UniswapV3PairSwaps } from './uniswapV3.types'

export class UniswapV3Adapter extends AbstractAdvancedTradingViewAdapter {
  private _key: AdapterKeys
  private _adapterSupportedChains: ChainId[]
  private _subgraphUrls: {
    [ChainId.MAINNET]: string
  }

  constructor({
    key,
    adapterSupportedChains,
    subgraphUrls,
  }: {
    key: AdapterKeys
    adapterSupportedChains: ChainId[]
    platform: RoutablePlatform
    subgraphUrls: {
      [ChainId.MAINNET]: string
    }
  }) {
    super()

    this._key = key
    this._subgraphUrls = subgraphUrls
    this._adapterSupportedChains = adapterSupportedChains
  }

  public updateActiveChainId(chainId: ChainId) {
    this._chainId = chainId
  }

  public setInitialArguments({ chainId, store }: AdapterInitialArguments) {
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

    const subgraphPairId = this._getPairId(inputToken, outputToken)

    if (!subgraphPairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][subgraphPairId]

    if ((pair && !isFirstFetch && !pair.swaps?.hasMore) || (pair && isFirstFetch)) return

    try {
      const { swaps } = await request<UniswapV3PairSwaps>({
        url: this._subgraphUrls[this._chainId],
        document: UNISWAP_PAIR_SWAPS,
        variables: {
          token0_in: [inputToken.address.toLowerCase(), outputToken.address.toLowerCase()],
          token1_in: [inputToken.address.toLowerCase(), outputToken.address.toLowerCase()],
          first: amountToFetch,
          skip: pair?.swaps?.data.length ?? 0,
        },
        signal: abortController(`${this._key}-pair-trades`) as RequestOptions['signal'],
      })

      const hasMore = swaps.length === amountToFetch

      this.store.dispatch(
        this.actions.setPairDataUniswapV3({
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

    const pairId = this._getPairId(inputToken, outputToken)

    if (!pairId) return

    const pair = this.store.getState().advancedTradingView.adapters[this._key][pairId]

    if ((pair && !isFirstFetch && !pair.burnsAndMints?.hasMore) || (pair && isFirstFetch)) return

    try {
      const { burns, mints } = await request<UniswapV3PairBurnsAndMints>({
        url: this._subgraphUrls[this._chainId],
        document: UNISWAP_PAIR_BURNS_AND_MINTS,
        variables: {
          token0_in: [inputToken.address.toLowerCase(), outputToken.address.toLowerCase()],
          token1_in: [inputToken.address.toLowerCase(), outputToken.address.toLowerCase()],
          first: amountToFetch,
          skip: pair?.burnsAndMints?.data.length ?? 0,
        },
        signal: abortController(`${this._key}-pair-activity`) as RequestOptions['signal'],
      })

      const hasMore = Boolean(burns.length === amountToFetch || mints.length === amountToFetch)

      this.store.dispatch(
        this.actions.setPairDataUniswapV3({
          key: this._key,
          pairId: pairId,
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

  private _getPairId(inputToken: Token, outputToken: Token) {
    try {
      const [token0, token1] = sortsBeforeTokens(inputToken, outputToken)
      return `${token0.address}-${token1.address}`
    } catch {}
  }

  private _isSupportedChainId(chainId?: ChainId): chainId is ChainId.MAINNET {
    if (!chainId) return false

    return this._adapterSupportedChains.includes(chainId)
  }
}
