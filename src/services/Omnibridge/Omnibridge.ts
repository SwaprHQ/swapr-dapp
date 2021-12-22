import { Store } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { Web3Provider } from '@ethersproject/providers'

import { AppState } from '../../state'
import { ArbitrumBridge } from './ArbitrumBridge'
import { BridgeProviders, initiateBridgeProviders } from './Omnibridge.providers'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

const staticProviders = initiateBridgeProviders()

export interface OmnibridgeConstructorParams {
  store: Store<AppState>
}

export interface OmnibridgeChangeHandler {
  account: string
  activeProvider: Web3Provider
}

export class Omnibridge {
  public readonly staticProviders: BridgeProviders
  public readonly store: OmnibridgeConstructorParams['store']
  private _activeProvider: Web3Provider | undefined
  private _activeChainId: ChainId | undefined
  private _account: string | undefined
  private _arbBridge: ArbitrumBridge | undefined
  private _initialized = false

  constructor({ store }: OmnibridgeConstructorParams) {
    this.staticProviders = staticProviders
    this.store = store
  }

  public get activeProvider() {
    if (!this._activeProvider) throw new Error('Omnibridge: No active provider')
    return this._activeProvider
  }

  public get activeChainId() {
    if (!this._activeChainId) throw new Error('Omnibridge: No active chain id')
    return this._activeChainId
  }

  public get account() {
    if (!this._account) throw new Error('Omnibridge: No account set')
    return this._account
  }

  public get arbBridge() {
    if (!this._arbBridge) throw new Error('Omnibridge: No arb bridge')
    return this._arbBridge
  }

  public init = async ({ account, activeProvider }: OmnibridgeChangeHandler) => {
    this._account = account
    this._activeProvider = activeProvider
    const activeChainId = (await this._activeProvider.getNetwork()).chainId

    if (activeChainId === this._activeChainId) return
    const previousChainId = this._activeChainId
    this._activeChainId = activeChainId

    if (!this._initialized) {
      this._arbBridge = await ArbitrumBridge.init({ omnibridge: this })
      this._initialized = true
      return
    }

    // Fire onSignerChange handlers
    this.arbBridge.onSignerChange({ previousChainId })
  }

  // ADAPTERS
  public withdraw = async (value: string, tokenAddress?: string) => {
    return this.arbBridge.withdraw(value, tokenAddress)
  }

  public deposit = async (value: string, tokenAddress?: string) => {
    return this.arbBridge.deposit(value, tokenAddress)
  }

  public approve = async (erc20L1Address: string, gatewayAddress?: string, tokenSymbol?: string) => {
    return this.arbBridge.approveERC20(erc20L1Address, gatewayAddress, tokenSymbol)
  }

  public collect = async (l2Tx: BridgeTransactionSummary) => {
    return this.arbBridge.collect(l2Tx)
  }
}
