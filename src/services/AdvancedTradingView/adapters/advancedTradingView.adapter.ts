import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { actions } from '../advancedTradingView.reducer'
import {
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

  abstract setInitialArgumentsForPair(inputToken: Token, outputToken: Token): void

  abstract getPairTrades(first: number, skip: number): Promise<void>

  abstract getPairActivity(first: number, skip: number): Promise<void>
}

export class AdvancedTradingViewAdapter {
  private _chainId: ChainId
  private _adapters: Adapters
  public readonly store: Store<AppState>

  private _initialized = false

  constructor({ adapters, chainId, store }: AdvancedTradingViewAdapterConstructorParams) {
    this._adapters = adapters
    this._chainId = chainId
    this.store = store
  }

  public get isInitialized() {
    return this._initialized
  }

  public get actions() {
    return actions
  }

  public init = () => {
    this._initialized = true

    for (const adapter of Object.values(this._adapters)) {
      adapter.setInitialArguments({ chainId: this._chainId, store: this.store })
    }
  }

  public setPairTokens = (inputToken: Token, outputToken: Token) => {
    this.store.dispatch(this.actions.setPairTokens({ inputToken, outputToken }))
  }

  public updateActiveChainId = (chainId: ChainId) => {
    for (const adapter of Object.values(this._adapters)) {
      adapter.updateActiveChainId(chainId)
    }
  }

  public setInitialArgumentsForPair = (inputToken: Token, outputToken: Token) => {
    for (const adapter of Object.values(this._adapters)) {
      adapter.setInitialArgumentsForPair(inputToken, outputToken)
    }
  }

  public fetchPairTrades = async (first: number, skip: number) => {
    const promises = Object.values(this._adapters).map(adapter => adapter.getPairTrades(first, skip))

    return await Promise.all(promises)
  }

  public fetchPairActivity = async (first: number, skip: number) => {
    const promises = Object.values(this._adapters).map(adapter => adapter.getPairActivity(first, skip))

    return await Promise.all(promises)
  }
}
