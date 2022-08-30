import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { actions } from '../advancedTradingView.reducer'
import {
  AdapterFetchDetails,
  AdapterInitialArguments,
  Adapters,
  AdvancedTradingViewAdapterConstructorParams,
} from '../advancedTradingView.types'

// each adapter should extend this class
export abstract class AbstractAdvancedTradingViewAdapter {
  protected _chainId: ChainId | undefined
  protected _store: Store<AppState> | undefined

  abstract updateActiveChainId(chainId: ChainId): void

  abstract setInitialArguments({ chainId, store }: AdapterInitialArguments): void

  abstract getPairTrades(fetchDetails: AdapterFetchDetails): Promise<void>

  abstract getPairActivity(fetchDetails: AdapterFetchDetails): Promise<void>
}

export class AdvancedTradingViewAdapter {
  private _chainId: ChainId
  private _adapters: Adapters
  private _initialized = false
  private _abortControllers: { [id: string]: AbortController } = {}
  public readonly store: Store<AppState>

  constructor({ store, chainId, adapters }: AdvancedTradingViewAdapterConstructorParams) {
    this.store = store
    this._chainId = chainId
    this._adapters = adapters
  }

  private renewAbortController = (key: string) => {
    if (this._abortControllers[key]) {
      this._abortControllers[key].abort()
    }

    this._abortControllers[key] = new AbortController()

    return this._abortControllers[key].signal
  }

  public get actions() {
    return actions
  }

  public get isInitialized() {
    return this._initialized
  }

  public init() {
    this._initialized = true

    for (const adapter of Object.values(this._adapters)) {
      adapter.setInitialArguments({
        chainId: this._chainId,
        store: this.store,
      })
    }
  }

  public setPairTokens(inputToken: Token, outputToken: Token) {
    this.store.dispatch(this.actions.setPairTokens({ inputToken, outputToken }))
  }

  public updateActiveChainId(chainId: ChainId) {
    this.store.dispatch(this.actions.resetAdapterStore())

    for (const adapter of Object.values(this._adapters)) {
      adapter.updateActiveChainId(chainId)
    }
  }

  public async fetchPairTrades(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairTrades({ ...fetchDetails, abortController: this.renewAbortController })
    )

    return await Promise.all(promises)
  }

  public async fetchPairActivity(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairActivity({ ...fetchDetails, abortController: this.renewAbortController })
    )

    return await Promise.all(promises)
  }
}
