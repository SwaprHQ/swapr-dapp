import { ChainId, Pair, Token } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { subgraphClientsUris } from '../../../../apollo/client'
import { actions } from '../../advancedTradingView.reducer'
import { AdapterFetchDetails, AdapterInitialArguments, AdapterPayloadType } from '../../advancedTradingView.types'
import { AbstractAdvancedTradingViewAdapter } from '../advancedTradingView.adapter'
import { SWAPR_PAIR_BURNS_AND_MINTS, SWAPR_PAIR_SWAPS } from './swapr.queries'
import { SwaprPairBurnsAndMints, SwaprPairSwaps } from './swapr.types'

export class SwaprAdapter extends AbstractAdvancedTradingViewAdapter {
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

    const subgraphPairId = this._getSubgraphPairId(inputToken, outputToken)

    const swaprPair = this.store.getState().advancedTradingView.adapters.swapr[subgraphPairId]

    if ((swaprPair && !isFirstFetch && !swaprPair.swaps?.hasMore) || (swaprPair && isFirstFetch)) return

    try {
      const { swaps } = await request<SwaprPairSwaps>({
        url: subgraphClientsUris[this._chainId],
        document: SWAPR_PAIR_SWAPS,
        variables: {
          pairId: subgraphPairId,
          first: amountToFetch,
          skip: swaprPair?.swaps?.data.length ?? 0,
        },
        signal: abortController('swapr-pair-trades') as RequestOptions['signal'],
      })

      const hasMore = swaps.length === amountToFetch

      this.store.dispatch(
        this.actions.setSwaprPairData({
          data: swaps,
          pairId: subgraphPairId,
          hasMore,
          payloadType: AdapterPayloadType.swaps,
        })
      )
    } catch {}
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

    const swaprPair = this.store.getState().advancedTradingView.adapters.swapr[subgraphPairId]

    if ((swaprPair && !isFirstFetch && !swaprPair.burnsAndMints?.hasMore) || (swaprPair && isFirstFetch)) return

    try {
      const { burns, mints } = await request<SwaprPairBurnsAndMints>({
        url: subgraphClientsUris[this._chainId],
        document: SWAPR_PAIR_BURNS_AND_MINTS,
        variables: {
          pairId: subgraphPairId,
          first: amountToFetch,
          skip: swaprPair?.burnsAndMints?.data.length ?? 0,
        },
        signal: abortController('swapr-pair-activity') as RequestOptions['signal'],
      })

      const hasMore = Boolean(burns.length === amountToFetch || mints.length === amountToFetch)

      this.store.dispatch(
        this.actions.setSwaprPairData({
          data: [...burns, ...mints],
          pairId: subgraphPairId,
          hasMore,
          payloadType: AdapterPayloadType.burnsAndMints,
        })
      )
    } catch {}
  }

  private get actions() {
    return actions
  }

  private get store() {
    if (!this._store) throw new Error('No store set')

    return this._store
  }

  private _getSubgraphPairId(inputToken: Token, outputToken: Token) {
    return Pair.getAddress(inputToken, outputToken).toLowerCase()
  }

  private _isSupportedChainId(chainId?: ChainId): chainId is ChainId.MAINNET | ChainId.GNOSIS | ChainId.ARBITRUM_ONE {
    if (!chainId) return false

    return [ChainId.MAINNET, ChainId.ARBITRUM_ONE, ChainId.GNOSIS].includes(chainId)
  }
}
