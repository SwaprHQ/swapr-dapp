import { Store } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { OmnibridgeChildBase } from './Omnibridge.utils'
import { initiateOmnibridgeProviders } from './Omnibridge.providers'
import {
  BridgeList,
  OmnibridgeProviders,
  SupportedChainsConfig,
  OmnibridgeChangeHandler,
  OmnibridgeConstructorParams
} from './Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { commonActions } from './store/Common.reducer'
import { AppState } from '../../state'

export class Omnibridge {
  public readonly staticProviders: OmnibridgeProviders
  public readonly store: OmnibridgeConstructorParams['store']
  public readonly bridges: { [k in BridgeList]: OmnibridgeChildBase }
  private _initialized = false
  private _activeChainId: ChainId | undefined // Assumed that activeChainId === activeProvider.getChain(), so if activeChain changes then signer changes

  private get _activeBridgeId() {
    return this.store.getState().omnibridge.common.activeBridge
  }

  private _callForEachBridge = async (method: (bridgeKey: BridgeList) => Promise<any>, errorText: string) => {
    const promises = (Object.keys(this.bridges) as BridgeList[]).map(bridgeKey => {
      return new Promise<BridgeList>(async (res, rej) => {
        try {
          await method(bridgeKey)
          res(bridgeKey)
        } catch (e) {
          rej(bridgeKey)
        }
      })
    })

    const callStatuses = await Promise.allSettled(promises)

    callStatuses.forEach(res => {
      if (res.status === 'rejected') {
        console.warn(`Omni: ${errorText} ${res.reason}`)
      }
    })
  }

  public get ready() {
    return this._initialized
  }

  constructor(store: Store<AppState>, config: OmnibridgeChildBase[]) {
    const { bridges, supportedChains } = config.reduce(
      (total, bridge) => {
        total.bridges[bridge.bridgeId] = bridge
        total.supportedChains[bridge.bridgeId] = bridge.supportedChains
        return total
      },
      { bridges: {}, supportedChains: {} } as {
        bridges: { [k in BridgeList]: OmnibridgeChildBase }
        supportedChains: { [k in BridgeList]: SupportedChainsConfig }
      }
    )

    this.store = store
    this.bridges = bridges

    this.staticProviders = initiateOmnibridgeProviders()
    this.store.dispatch(commonActions.setSupportedChains(supportedChains))
  }

  public updateSigner = async (signerData: Omit<OmnibridgeChangeHandler, 'previousChainId'>) => {
    const previousChainId = this._activeChainId
    this._activeChainId = signerData.activeChainId

    const signerChangeCall = (bridgeKey: BridgeList) =>
      this.bridges[bridgeKey].onSignerChange({ previousChainId, ...signerData })

    await this._callForEachBridge(signerChangeCall, 'onSignerChange() failed for')
  }

  public init = async ({ account, activeProvider, activeChainId }: OmnibridgeChangeHandler) => {
    if (this._initialized) return

    this._activeChainId = activeChainId

    const initCall = (bridgeKey: BridgeList) =>
      this.bridges[bridgeKey].init({
        account,
        activeChainId,
        activeProvider,
        staticProviders: this.staticProviders,
        store: this.store
      })
    await this._callForEachBridge(initCall, 'init() failed for')

    const staticListsCall = (bridgeKey: BridgeList) => this.bridges[bridgeKey].fetchStaticLists()
    await this._callForEachBridge(staticListsCall, 'fetchStaticLists() failed for')

    this._initialized = true
  }

  public getSupportedBridges = () => {
    //TODO filter by supported token
    // const supportedBridges =
    //1.
    // supportedBridges.forEach(bridge => {
    //todo
    // })
    //2.
    // supportedBridges.forEach(bridge => {
    // bridge.bridge.getBridgingMetadata()
    // })
    // return supportedBridges
  }

  // ADAPTERS
  public triggerBridging = async () => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].triggerBridging()
  }

  public approve = async () => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].approve()
  }

  public collect = async (l2Tx: BridgeTransactionSummary) => {
    if (!this._initialized || !l2Tx.bridgeId) return
    return this.bridges[l2Tx.bridgeId].collect(l2Tx)
  }

  public triggerCollect = (l2Tx: BridgeTransactionSummary) => {
    if (!this._initialized || !l2Tx.bridgeId) return
    return this.bridges[l2Tx.bridgeId].triggerCollect(l2Tx)
  }
  public validate = async () => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].validate()
  }
}
