import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import {
  AdapterFetchDetails,
  AdapterFetchDetailsExtended,
  AdapterInitialArguments,
  AdapterKey,
  AdapterPayloadType,
  Adapters,
  AdvancedTradingViewAdapterConstructorParams,
} from '../advancedTradingView.types'
import { actions } from '../store/advancedTradingView.reducer'

// each adapter should extend this class
export abstract class AbstractAdvancedTradingViewAdapter<AppState> {
  protected _key: AdapterKey
  protected _chainId: ChainId | undefined
  protected _store: Store<AppState> | undefined
  protected _adapterSupportedChains: ChainId[]

  constructor({ key, adapterSupportedChains }: { key: AdapterKey; adapterSupportedChains: ChainId[] }) {
    this._key = key
    this._adapterSupportedChains = adapterSupportedChains
  }

  abstract getPairTrades(fetchDetails: AdapterFetchDetails): Promise<void>

  abstract getPairTradingAndActivityData(fetchDetails: AdapterFetchDetails): any

  // TODO: UPDATE RES TYPE
  abstract getPairData(fetchDetails: AdapterFetchDetailsExtended): any

  abstract getPairActivity(fetchDetails: AdapterFetchDetails): Promise<void>

  public updateActiveChainId(chainId: ChainId) {
    this._chainId = chainId
  }

  public setInitialArguments({ chainId, store }: AdapterInitialArguments<AppState>) {
    this._chainId = chainId
    this._store = store
  }

  protected get actions() {
    return actions
  }

  protected get store() {
    if (!this._store) throw new Error('No store set')

    return this._store
  }

  public isSupportedChainId(
    chainId?: ChainId
  ): chainId is ChainId.MAINNET | ChainId.GNOSIS | ChainId.ARBITRUM_ONE | ChainId.OPTIMISM_MAINNET | ChainId.POLYGON {
    if (!chainId) return false

    return this._adapterSupportedChains.includes(chainId)
  }
}

export class AdvancedTradingViewAdapter<AppState> {
  private _chainId: ChainId
  private _adapters: Adapters<AppState>
  private _initialized = false
  private _abortControllers: { [id: string]: AbortController } = {}
  public readonly store: Store<AppState>

  constructor({ store, chainId, adapters }: AdvancedTradingViewAdapterConstructorParams<AppState>) {
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
    this.store.dispatch(this.actions.resetAdapterStore({ resetSelectedPair: true }))

    for (const adapter of Object.values(this._adapters)) {
      adapter.updateActiveChainId(chainId)
    }
  }

  public async fetchPairTrades(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairTrades({ ...fetchDetails, abortController: this.renewAbortController })
    )

    return await Promise.allSettled(promises)
  }

  public async fetchPairActivity(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairActivity({ ...fetchDetails, abortController: this.renewAbortController })
    )

    return await Promise.allSettled(promises)
  }

  public async fetchPairTradesAndActivityBulkUpdate(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairTradingAndActivityData({
        ...fetchDetails,
        abortController: this.renewAbortController,
      })
    )

    const response = await Promise.allSettled(promises).then(
      (res: PromiseSettledResult<{ status: 'fulfilled' | 'rejected'; value: any }>[]) =>
        res.filter(el => el.status === 'fulfilled' && el.value).map(el => el.status === 'fulfilled' && el.value)
    )

    console.log('SWAPS, BURNS AND MINTS', response)

    // @ts-ignore
    this.store.dispatch(this.actions.setSwapsBurnsAndMintsDataForAllPairs(response))
  }

  public async fetchPairTradesBulkUpdate(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairData({
        ...fetchDetails,
        abortController: this.renewAbortController,
        payloadType: AdapterPayloadType.SWAPS,
      })
    )

    const response = await Promise.allSettled(promises).then(
      (res: PromiseSettledResult<{ status: 'fulfilled' | 'rejected'; value: any }>[]) =>
        res.filter(el => el.status === 'fulfilled' && el.value).map(el => el.status === 'fulfilled' && el.value)
    )

    // @ts-ignore
    this.store.dispatch(this.actions.setDataTypeForAllPairs(response))
  }

  public async fetchPairActivityBulkUpdate(fetchDetails: Omit<AdapterFetchDetails, 'abortController'>) {
    const promises = Object.values(this._adapters).map(adapter =>
      adapter.getPairData({
        ...fetchDetails,
        abortController: this.renewAbortController,
        payloadType: AdapterPayloadType.BURNS_AND_MINTS,
      })
    )

    const response = await Promise.allSettled(promises).then(
      (res: PromiseSettledResult<{ status: 'fulfilled' | 'rejected'; value: any }>[]) =>
        res.filter(el => el.status === 'fulfilled' && el.value).map(el => el.status === 'fulfilled' && el.value)
    )

    // @ts-ignore
    this.store.dispatch(this.actions.setDataTypeForAllPairs(response))
  }
}
