import { ChainId, Pair, Token } from '@swapr/sdk'

import { request, RequestOptions } from 'graphql-request'

import { subgraphClientsUris } from '../../../apollo/client'
import { SWAPR_PAIR_ACTIVITY, SWAPR_PAIR_TRADES } from '../advancedTradingView.queries'
import { actions } from '../advancedTradingView.reducer'
import { AdapterInitialArguments, SwaprActivity, SwaprTrades } from '../advancedTradingView.types'
import { AbstractAdvancedTradingViewAdapter } from './advancedTradingView.adapter'

export class SwaprAdapter extends AbstractAdvancedTradingViewAdapter {
  private get store() {
    if (!this._store) throw new Error('No store set')

    return this._store
  }

  private get actions() {
    return actions
  }

  public updateActiveChainId = (chainId: ChainId) => {
    this._chainId = chainId
  }

  public setInitialArguments = ({ chainId, store }: AdapterInitialArguments) => {
    this._chainId = chainId
    this._store = store
  }

  public setInitialArgumentsForPair = (inputToken: Token, outputToken: Token) => {
    const pairId = Pair.getAddress(inputToken, outputToken).toLowerCase()

    this.store.dispatch(this.actions.setSwaprPairInitialArguments(pairId))
  }

  public getPairTrades = async (first: number, skip: number, abort: (id: string) => AbortSignal) => {
    const pairId = this.store.getState().advancedTradingView.adapters.swapr.pair.id?.toLowerCase()
    const hasMoreTrades = this.store.getState().advancedTradingView.adapters.swapr.fetchDetails.hasMoreTrades

    if (
      !this._chainId ||
      (this._chainId !== ChainId.MAINNET &&
        this._chainId !== ChainId.ARBITRUM_ONE &&
        this._chainId !== ChainId.GNOSIS) ||
      !hasMoreTrades
    )
      return

    try {
      const data = await request<SwaprTrades>({
        url: subgraphClientsUris[this._chainId],
        document: SWAPR_PAIR_TRADES,
        variables: {
          pairId,
          first,
          skip,
        },
        signal: abort('swapr-pair-trades') as RequestOptions['signal'],
      })

      const hasMore = data.pair?.swaps.length === first

      this.store.dispatch(this.actions.setSwaprPairTrades({ data, hasMore }))
    } catch {}
  }

  public getPairActivity = async (first: number, skip: number, abort: (id: string) => AbortSignal) => {
    const pairId = this.store.getState().advancedTradingView.adapters.swapr.pair.id?.toLowerCase()
    const hasMoreActivity = this.store.getState().advancedTradingView.adapters.swapr.fetchDetails.hasMoreActivity

    if (
      !this._chainId ||
      (this._chainId !== ChainId.MAINNET &&
        this._chainId !== ChainId.ARBITRUM_ONE &&
        this._chainId !== ChainId.GNOSIS) ||
      !hasMoreActivity
    )
      return

    try {
      const data = await request<SwaprActivity>({
        url: subgraphClientsUris[this._chainId],
        document: SWAPR_PAIR_ACTIVITY,
        variables: {
          pairId,
          first,
          skip,
        },
        signal: abort('swapr-pair-activity') as RequestOptions['signal'],
      })

      const hasMore = data.pair?.burns.length === first || data.pair?.mints.length === first

      this.store.dispatch(this.actions.setSwaprPairActivity({ data, hasMore }))
    } catch (e) {}
  }
}
