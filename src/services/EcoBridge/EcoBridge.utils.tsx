import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import {
  BridgeList,
  EcoBridgeChangeHandler,
  EcoBridgeChildBaseConstructor,
  EcoBridgeChildBaseInit,
  EcoBridgeChildBaseProps,
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

export const getErrorMsg = (error: any, bridgeId: BridgeList) => {
  if (error?.code === 4001) {
    return 'Transaction rejected'
  }
  if (bridgeId === 'socket' && error.status === 500 && !error.ok) {
    return 'Socket API is temporarily unavailable'
  }
  return `Bridge failed: ${reduceMessage(error.message)}`
}
