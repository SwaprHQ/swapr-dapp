import { createSlice, PayloadAction, SliceCaseReducers, ValidateSliceCaseReducers } from '@reduxjs/toolkit'
import { TokenList } from '@uniswap/token-lists'

import { subgraphClients } from '../../apollo/client'
import { GetBundleQuery, GetBundleDocument } from '../../graphql/generated/schema'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { SWPRSupportedChains } from '../../utils/chainSupportsSWPR'

import {
  BridgeDetails,
  BridgeList,
  BridgeModalData,
  BridgeModalStatus,
  BridgingDetailsErrorMessage,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  EcoBridgeChildBaseProps,
  EcoBridgeChildBaseState,
  EcoBridgeInitialEnv,
  SyncState,
} from './EcoBridge.types'
import { commonActions } from './store/Common.reducer'
import { ecoBridgeUIActions } from './store/UI.reducer'

export enum ButtonStatus {
  APPROVE = 'Approve',
  APPROVING = 'Approving',
  BRIDGE = 'Bridge',
  LOADING = 'Loading',
}

const getIndexOfSpecialCharacter = (message: string) => {
  for (let index = 0; index < message.length; index++) {
    if ("/[!@#$%^&*()_+-=[]{};':\\|,.<>/?]+/".indexOf(message[index]) !== -1) return index
  }
  return
}

const reduceMessage = (message?: string) => {
  if (!message) return ''

  return message.slice(0, getIndexOfSpecialCharacter(message))
}

export const getErrorMsg = (error: any, bridgeId?: BridgeList) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  if (bridgeId === 'socket' && error.status === 500 && !error.ok) {
    return 'Socket API is temporarily unavailable'
  }
  return `Bridge failed: ${reduceMessage(error.message)}`
}

export abstract class EcoBridgeChildBase {
  public readonly bridgeId: BridgeList
  public readonly displayName: string
  public readonly displayUrl: string
  public readonly supportedChains: EcoBridgeChildBaseConstructor['supportedChains']
  protected ecoBridgeUIActions: typeof ecoBridgeUIActions
  protected commonActions: typeof commonActions
  protected _store: EcoBridgeChildBaseProps['store']
  protected _account: EcoBridgeChildBaseProps['account']
  protected _activeChainId: EcoBridgeChildBaseProps['activeChainId']
  protected _staticProviders: EcoBridgeChildBaseProps['staticProviders']
  protected _activeProvider: EcoBridgeChildBaseProps['activeProvider']
  protected _baseActions: ReturnType<typeof createEcoBridgeChildBaseSlice>['actions'] | undefined
  private _listeners: NodeJS.Timeout[] = []
  protected readonly _receiveAmountDecimalPlaces = 3

  constructor({ supportedChains, bridgeId, displayName, displayUrl }: EcoBridgeChildBaseConstructor) {
    this.bridgeId = bridgeId
    this.displayName = displayName
    this.displayUrl = displayUrl
    this.supportedChains = supportedChains
    this.ecoBridgeUIActions = ecoBridgeUIActions
    this.commonActions = commonActions
  }

  private _log = (message: string) => `EcoBridge::${this.bridgeId}: ${message}`

  private _loggerUtils = {
    log: (message: string) => console.log(this._log(message)),
    error: (message: string) => new Error(this._log(message)),
  }

  private _metadataStatusUtils = {
    start: () => {
      if (!this._store || !this._baseActions) {
        throw new Error('Initial env not set')
      }

      const lastRequestId = this._store.getState().ecoBridge[this.bridgeId].lastMetadataCt

      const requestId = (lastRequestId ?? 0) + 1

      this._store.dispatch(this._baseActions.requestStarted({ id: requestId }))
      this._store.dispatch(this._baseActions.setBridgeDetailsStatus({ status: SyncState.LOADING }))

      return requestId
    },
    fail: (errorMessage?: BridgingDetailsErrorMessage) => {
      if (!this._store || !this._baseActions) {
        throw new Error('Initial env not set')
      }
      this._store.dispatch(
        this._baseActions.setBridgeDetailsStatus({
          status: SyncState.FAILED,
          errorMessage,
        })
      )
    },
  }

  private _listenerUtils = {
    start: (listeners: { listener: () => void; interval?: number }[]) => {
      if (this._listeners.length) {
        throw this._loggerUtils.error('Listeners already started')
      }
      this._listeners = listeners.map(({ listener, interval }) => setInterval(listener, interval ?? 5000))
    },
    stop: () => {
      this._listeners.forEach(listener => clearInterval(listener))
      this._listeners = []
    },
  }

  // Utils should go to separate abstract service that will be extended by EcoBridgeChildBase
  // Not sure about nesting and naming...
  // listeners are ok, same for logger, I dont thing UI needs to be so deepy nested
  // add more modal controls and replace them in all bridges
  // replace _baseActions with ecoBridgeActions
  public ecoBridgeUtils = {
    listeners: this._listenerUtils,
    metadataStatus: this._metadataStatusUtils,
    logger: this._loggerUtils,
    ui: {
      modal: {
        setBridgeModalStatus: (status: BridgeModalStatus, bridgeId?: BridgeList, error?: any) => {
          this.store.dispatch(
            this.ecoBridgeUIActions.setBridgeModalStatus({
              status,
              error: error && getErrorMsg(error, bridgeId),
            })
          )
        },
      },
      setModalData: (props: BridgeModalData) => {
        this.store.dispatch(ecoBridgeUIActions.setBridgeModalData(props))
      },
      statusButton: {
        setStatus: (status: ButtonStatus) => {
          let payload: {
            isError?: boolean
            isLoading?: boolean
            label?: string
            isBalanceSufficient?: boolean
            isApproved?: boolean
          } = {}

          switch (status) {
            case ButtonStatus.APPROVE:
              payload = {
                label: 'Approve',
                isLoading: false,
                isError: false,
                isApproved: false,
                isBalanceSufficient: true,
              }
              break
            case ButtonStatus.APPROVING:
              payload = {
                label: 'Approving',
                isError: false,
                isLoading: true,
                isBalanceSufficient: true,
                isApproved: false,
              }
              break
            case ButtonStatus.BRIDGE:
              payload = {
                label: 'Bridge',
                isError: false,
                isLoading: false,
                isBalanceSufficient: true,
                isApproved: true,
              }
              break
            case ButtonStatus.LOADING:
              payload = {
                label: 'Loading',
                isLoading: true,
                isError: false,
                isApproved: false,
                isBalanceSufficient: false,
              }
              break
          }

          this.store.dispatch(this.ecoBridgeUIActions.setStatusButton(payload))
        },
        setError: (label = 'Something went wrong') => {
          this.store.dispatch(
            this.ecoBridgeUIActions.setStatusButton({
              label,
              isLoading: false,
              isError: true,
              isApproved: false,
              isBalanceSufficient: false,
            })
          )
        },
        setCustomStatus: (payload: {
          isError?: boolean
          isLoading?: boolean
          label?: string
          isBalanceSufficient?: boolean
          isApproved?: boolean
        }) => {
          this.store.dispatch(this.ecoBridgeUIActions.setStatusButton(payload))
        },
      },
    },
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

  protected setBaseActions = (actions: ReturnType<typeof createEcoBridgeChildBaseSlice>['actions']) => {
    this._baseActions = actions
  }

  protected get store() {
    if (!this._store) throw new Error(`${this.bridgeId}: No store set`)
    return this._store
  }

  protected get baseActions() {
    if (!this._baseActions) throw new Error('No baseActions set')

    return this._baseActions
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
    initialState: createBridgeChildBaseInitialState(initialState),
    reducers: {
      requestStarted: (state, action: PayloadAction<{ id: number }>) => {
        state.lastMetadataCt = action.payload.id
      },
      setBridgeDetails: (state, action: PayloadAction<BridgeDetails>) => {
        const { gas, fee, estimateTime, receiveAmount, requestId, routeId } = action.payload

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
          routeId,
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

export const getNativeCurrencyPrice = async (activeChainId: SWPRSupportedChains): Promise<number> => {
  const {
    data: { bundle },
    error,
  } = await subgraphClients[activeChainId].query<GetBundleQuery>({
    query: GetBundleDocument,
  })
  if (error) {
    console.error('Native Currency fetch error : ', error.message)
  }
  const { nativeCurrencyPrice } = bundle ?? { nativeCurrencyPrice: 0 }

  return Number(nativeCurrencyPrice ?? 0)
}
