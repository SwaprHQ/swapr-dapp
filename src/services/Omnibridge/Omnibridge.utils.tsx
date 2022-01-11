import {
  OmnibridgeChangeHandler,
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  OmnibridgeChildBaseProps,
  OmnibridgeInitialEnv
} from './Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

export abstract class OmnibridgeChildBase {
  public readonly supportedChains: OmnibridgeChildBaseConstructor['supportedChains']

  protected _store: OmnibridgeChildBaseProps['store']
  protected _account: OmnibridgeChildBaseProps['account']
  protected _activeChainId: OmnibridgeChildBaseProps['activeChainId']
  protected _staticProviders: OmnibridgeChildBaseProps['staticProviders']
  protected _activeProvider: OmnibridgeChildBaseProps['activeProvider']

  constructor({ supportedChains }: OmnibridgeChildBaseConstructor) {
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
  abstract withdraw(value: string, tokenAddress?: string): void
  abstract deposit(value: string, tokenAddress?: string): void
  abstract collect(l2Tx: BridgeTransactionSummary): void
  abstract approve(erc20L1Address: string, gatewayAddress?: string, tokenSymbol?: string): void
}
