import { createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import {
  BridgeDetails,
  BridgeList,
  BridgingDetailsErrorMessage,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  EcoBridgeChildBaseProps,
  EcoBridgeChildBaseState,
  EcoBridgeInitialEnv,
  SyncState,
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

const ecoBridgeChildBaseInitialState: EcoBridgeChildBaseState = {
  lists: {},
  listsStatus: SyncState.IDLE,
  bridgingDetails: {},
  bridgingDetailsStatus: SyncState.IDLE,
  lastMetadataCt: 0,
}

function createBridgeChildBaseInitialState<T>(initialState: T): EcoBridgeChildBaseState & T {
  return { ...initialState, ...ecoBridgeChildBaseInitialState }
}

export const createEcoBridgeChildBaseSlice = <T, Reducers extends SliceCaseReducers<EcoBridgeChildBaseState & T>>({
  name,
  initialState,
  reducers,
}: {
  name: string
  initialState: T
  reducers: ValidateSliceCaseReducers<EcoBridgeChildBaseState & T, Reducers>
}) => {
  return createSlice({
    name,
    // TODO: double-check lazy loading
    initialState: () => createBridgeChildBaseInitialState(initialState),
    reducers: {
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
      setBridgeDetails: (state, action: PayloadAction<BridgeDetails>) => {
        const { gas, fee, estimateTime, receiveAmount, requestId } = action.payload

        //(store persist) crashing page without that code
        if (!state.bridgingDetails) {
          state.bridgingDetails = {}
        }

        if (requestId !== state.lastMetadataCt) {
          if (state.bridgingDetailsStatus === SyncState.FAILED) return
          state.bridgingDetailsStatus = SyncState.LOADING
          return
        } else {
          state.bridgingDetailsStatus = SyncState.READY
        }

        state.bridgingDetails = {
          gas,
          fee,
          estimateTime,
          receiveAmount,
        }
      },
      setBridgeDetailsStatus: (
        state,
        action: PayloadAction<{ status: SyncState; errorMessage?: BridgingDetailsErrorMessage }>
      ) => {
        const { status, errorMessage } = action.payload

        state.bridgingDetailsStatus = status

        if (errorMessage) {
          state.bridgingDetailsErrorMessage = errorMessage
        }
      },
      setTokenListsStatus: (state, action: PayloadAction<SyncState>) => {
        state.listsStatus = action.payload
      },
      addTokenLists: (state, action: PayloadAction<{ [id: string]: TokenList }>) => {
        const { payload } = action

        state.lists = payload
      },
      ...reducers,
    },
  })
}
