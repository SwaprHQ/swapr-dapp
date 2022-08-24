import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../../state'
import { actions } from '../trades.reducer'
import { AdapterInitialArguments, Adapters, TradesHistoryAdapterConstructorParams } from '../trades.types'

// each adapter should extend this class
export abstract class AbstractTradesAdapter {
  protected _chainId: ChainId | undefined
  protected _store: Store<AppState> | undefined

  abstract updateActiveChainId(chainId: ChainId): void

  abstract setInitialArguments({ chainId, store }: AdapterInitialArguments): void

  abstract getTradesHistoryForPair(inputToken: Token, outputToken: Token, first: number, skip: number): Promise<void>
}

export class TradesAdapter {
  private _chainId: ChainId
  private _adapters: Adapters
  public readonly store: Store<AppState>

  private _initialized = false

  public get isInitialized() {
    return this._initialized
  }

  public get actions() {
    return actions
  }

  constructor({ adapters, chainId, store }: TradesHistoryAdapterConstructorParams) {
    this._adapters = adapters
    this._chainId = chainId
    this.store = store
  }

  public init = () => {
    this._initialized = true

    for (const adapter of Object.values(this._adapters)) {
      adapter.setInitialArguments({ chainId: this._chainId, store: this.store })
    }
  }

  public fetchTradesHistory = async (inputToken: Token, outputToken: Token, first: number, skip: number) => {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getTradesHistoryForPair(inputToken, outputToken, first, skip)
    )

    return await Promise.all(promises)
  }

  public updateActiveChainId = (chainId: ChainId) => {
    for (const adapter of Object.values(this._adapters)) {
      adapter.updateActiveChainId(chainId)
    }
  }
  public setPairTokensAddresses = (inputToken: Token, outputToken: Token) => {
    this.store.dispatch(this.actions.setPairTokensAddresses({ inputToken, outputToken }))
  }
}
