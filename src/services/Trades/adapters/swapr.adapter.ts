import { ChainId, Pair, Token } from '@swapr/sdk'

import { request } from 'graphql-request'

import { subgraphClientsUris } from '../../../apollo/client'
import { SWAPR_PAIR_TRANSACTIONS } from '../trades.queries'
import { actions } from '../trades.reducer'
import { AdapterInitialArguments, AdapterKeys, SwaprTradesHistory } from '../trades.types'
import { AbstractTradesAdapter } from './trades.adapter'

export class SwaprAdapter extends AbstractTradesAdapter {
  private get store() {
    if (!this._store) throw new Error('No store set')

    return this._store
  }

  private get actions() {
    return actions
  }

  public setInitialArguments = ({ chainId, store }: AdapterInitialArguments) => {
    this._chainId = chainId
    this._store = store
  }

  public updateActiveChainId = (chainId: ChainId) => {
    this._chainId = chainId
  }

  public getTradesHistoryForPair = async (inputToken: Token, outputToken: Token, first: number, skip: number) => {
    const pairId = Pair.getAddress(inputToken, outputToken).toLowerCase()
    const { hasMore, pairId: previousPairId } = this.store.getState().trades.sources.swapr.fetchDetails

    // polygon is not supported
    if (!this._chainId || this._chainId === ChainId.POLYGON || (!hasMore && pairId === previousPairId)) return

    try {
      const data = await request<SwaprTradesHistory>(subgraphClientsUris[this._chainId], SWAPR_PAIR_TRANSACTIONS, {
        pairId,
        first,
        skip,
      })

      const hasMore = data.pair?.swaps.length && data.pair?.swaps.length === 50 ? true : false

      this.store.dispatch(this.actions.setSwaprTradesHistory({ data, hasMore, pairId }))
    } catch {
      // TODO: add error state for each adapter.
    }
  }
}
