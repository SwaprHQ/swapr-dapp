import { createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from '@reduxjs/toolkit'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import {
  BridgeList,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  EcoBridgeChildBaseProps,
  EcoBridgeChildBaseState,
  EcoBridgeInitialEnv,
} from './EcoBridge.types'

export abstract class EcoBridgeChildBase {
  public readonly bridgeId: BridgeList
  public readonly displayName: string
  public readonly supportedChains: EcoBridgeChildBaseConstructor['supportedChains']
  protected _store: EcoBridgeChildBaseProps['store']
  protected _account: EcoBridgeChildBaseProps['account']
  protected _activeChainId: EcoBridgeChildBaseProps['activeChainId']
  protected _staticProviders: EcoBridgeChildBaseProps['staticProviders']
  protected _activeProvider: EcoBridgeChildBaseProps['activeProvider']

  constructor({ supportedChains, bridgeId, displayName }: EcoBridgeChildBaseConstructor) {
    this.bridgeId = bridgeId
    this.displayName = displayName
    this.supportedChains = supportedChains
  }

  protected setSignerData = ({ account, activeChainId, activeProvider }: EcoBridgeChangeHandler) => {
    this._account = account
    this._activeChainId = activeChainId
    this._activeProvider = activeProvider
  }

  protected setInitialEnv = ({ staticProviders, store }: EcoBridgeInitialEnv) => {
    this._staticProviders = staticProviders
    this._store = store
  }

  protected startRequest = <T extends ReturnType<typeof createEcoBridgeChildBaseSlice>['actions']>({
    actions,
  }: {
    actions: T
  }) => {
    if (!this._store) return

    const lastRequestId = this._store.getState().ecoBridge[this.bridgeId].lastMetadataCt

    const requestId = (lastRequestId ?? 0) + 1

    this._store.dispatch(actions.requestStarted({ id: requestId }))

    return requestId
  }

  // To be implemented by bridge
  abstract init({
    account,
    activeChainId,
    activeProvider,
    staticProviders,
    store,
  }: EcoBridgeChildBaseInit): Promise<void>

  abstract onSignerChange({
    account,
    activeChainId,
    activeProvider,
    previousChainId,
  }: EcoBridgeChangeHandler): Promise<void>

  abstract validate(): void
  abstract approve(): void
  abstract collect(l2Tx?: BridgeTransactionSummary): void
  abstract triggerBridging(): void
  abstract fetchStaticLists(): Promise<void>
  abstract fetchDynamicLists(): Promise<void>
  abstract getBridgingMetadata(): void
}

export const ecoBridgeChildBaseInitialState: EcoBridgeChildBaseState = {
  lastMetadataCt: 0,
}

export const createEcoBridgeChildBaseSlice = <
  T extends EcoBridgeChildBaseState,
  Reducers extends SliceCaseReducers<T>
>({
  name,
  initialState,
  reducers,
}: {
  name: string
  initialState: T
  reducers: ValidateSliceCaseReducers<T, Reducers>
}) => {
  return createSlice({
    name,
    initialState,
    reducers: {
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
      ...reducers,
    },
  })
}
