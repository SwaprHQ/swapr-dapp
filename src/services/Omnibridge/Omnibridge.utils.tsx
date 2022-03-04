import {
  BridgeList,
  OmnibridgeChangeHandler,
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  OmnibridgeChildBaseProps,
  OmnibridgeInitialEnv
} from './Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { ChainId } from '@swapr/sdk'

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

  // TODO: Abstract parameters. Currently it's hardcoded to support arbitrum

  abstract triggerBridging(): void
  abstract fetchStaticLists(): Promise<void>
  abstract fetchDynamicLists(): Promise<void>
  abstract collect(l2Tx: BridgeTransactionSummary): void
  abstract approve(): void
  abstract triggerCollect(
    l2Tx: BridgeTransactionSummary
  ): { symbol: string; typedValue: string; fromChainId: ChainId; toChainId: ChainId }
  abstract validate(): void
  abstract getBridgingMetadata(): void
  abstract triggerModalDisclaimerText(): void
}
