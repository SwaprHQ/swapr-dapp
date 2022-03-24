import {
  BridgeList,
  OmnibridgeChangeHandler,
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  OmnibridgeChildBaseProps,
  OmnibridgeInitialEnv
} from './Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

export abstract class OmnibridgeChildBase {
  public readonly bridgeId: BridgeList
  public readonly displayName: string
  public readonly supportedChains: OmnibridgeChildBaseConstructor['supportedChains']
  protected _store: OmnibridgeChildBaseProps['store']
  protected _account: OmnibridgeChildBaseProps['account']
  protected _activeChainId: OmnibridgeChildBaseProps['activeChainId']
  protected _staticProviders: OmnibridgeChildBaseProps['staticProviders']
  protected _activeProvider: OmnibridgeChildBaseProps['activeProvider']

  constructor({ supportedChains, bridgeId, displayName }: OmnibridgeChildBaseConstructor) {
    this.bridgeId = bridgeId
    this.displayName = displayName
    this.supportedChains = supportedChains
  }

  protected setSignerData = ({ account, activeChainId, activeProvider }: OmnibridgeChangeHandler) => {
    this._account = account
    this._activeChainId = activeChainId
    this._activeProvider = activeProvider
  }

  protected setInitialEnv = ({ staticProviders, store }: OmnibridgeInitialEnv) => {
    this._staticProviders = staticProviders
    this._store = store
  }

  // To be implemented by bridge
  abstract init({
    account,
    activeChainId,
    activeProvider,
    staticProviders,
    store
  }: OmnibridgeChildBaseInit): Promise<void>

  abstract onSignerChange({
    account,
    activeChainId,
    activeProvider,
    previousChainId
  }: OmnibridgeChangeHandler): Promise<void>

  abstract validate(): void
  abstract approve(): void
  abstract collect(l2Tx?: BridgeTransactionSummary): void
  abstract triggerBridging(): void
  abstract triggerModalDisclaimerText(): void
  abstract fetchStaticLists(): Promise<void>
  abstract fetchDynamicLists(): Promise<void>
  abstract getBridgingMetadata(): void
}
