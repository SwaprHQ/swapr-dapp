import { ChainId, Pair, Token } from '@swapr/sdk'

import { subgraphClientsUris } from 'apollo/client'
import { request } from 'graphql-request'

import { actions } from '../store'
import { SWAPR_PAIR_TRANSACTIONS } from './queries'
import { AbstractTradesAdapter, AdapterInitialArguments, AdapterKeys } from './trades.adapter'

type LiquidityTransaction = {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

type TradesHistory = {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export type SwaprTradesHistory = {
  pair: {
    id: string
    token0: {
      symbol: string
    }
    token1: {
      symbol: string
    }
    burns: LiquidityTransaction[]
    mints: LiquidityTransaction[]
    swaps: TradesHistory[]
  } | null
}

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

  public getTradesHistoryForPair = async (inputToken: Token, outputToken: Token) => {
    // polygon is not supported
    if (!this._chainId || this._chainId === ChainId.POLYGON) return

    const pairId = Pair.getAddress(inputToken, outputToken).toLowerCase()

    try {
      this.store.dispatch(this.actions.setAdapterLoading({ key: AdapterKeys.SWAPR, isLoading: true }))

      const data = await request<SwaprTradesHistory>(subgraphClientsUris[this._chainId], SWAPR_PAIR_TRANSACTIONS, {
        pairId,
      })

      this.store.dispatch(this.actions.setSwaprTradesHistory(data))

      this.store.dispatch(this.actions.setAdapterLoading({ key: AdapterKeys.SWAPR, isLoading: false }))
    } catch {
      console.warn('Cannot fetch history transaction')
    }
  }
}
