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

  abstract getTradesHistoryForPair(inputToken: Token, outputToken: Token): Promise<void>
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

  public fetchTradesHistory = (inputToken: Token, outputToken: Token) => {
    for (const adapter of Object.values(this._adapters)) {
      adapter.getTradesHistoryForPair(inputToken, outputToken)
    }
  }

  public updateActiveChainId = (chainId: ChainId) => {
    for (const adapter of Object.values(this._adapters)) {
      adapter.updateActiveChainId(chainId)
    }
  }
  public setPairTokensAddresses = (addresses: { fromTokenAddress: string; toTokenAddress: string }) => {
    this.store.dispatch(this.actions.setPairTokensAddresses(addresses))
  }
}
