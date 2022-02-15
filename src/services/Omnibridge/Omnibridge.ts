import { Store } from '@reduxjs/toolkit'
import { ChainId } from '@swapr/sdk'
import { AppState } from '../../state'
import { OmnibridgeChildBase } from './Omnibridge.utils'
import { initiateOmnibridgeProviders } from './Omnibridge.providers'
import {
  BridgeList,
  OmnibridgeProviders,
  OmnibridgeChangeHandler,
  OmnibridgeConstructorParams
} from './Omnibridge.types'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

export class Omnibridge {
  public readonly staticProviders: OmnibridgeProviders
  public readonly store: OmnibridgeConstructorParams['store']
  public readonly bridges: { [k in BridgeList]: OmnibridgeChildBase }
  private _initialized = false
  private _activeChainId: ChainId | undefined // Assumed that activeChainId === activeProvider.getChain(), so if activeChain changes then signer changes
  private _activeBridgeId: BridgeList | undefined

  public setActiveBridge = (bridgeId: BridgeList) => {
    this._activeBridgeId = bridgeId
  }

  // TODO: Should be depreciated later on so no direct interaction with bride is possible
  public activeBridge<T extends OmnibridgeChildBase = OmnibridgeChildBase>() {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId] as T
  }

  public get ready() {
    return this._initialized
  }

  constructor(store: Store<AppState>, config: OmnibridgeChildBase[]) {
    this.staticProviders = initiateOmnibridgeProviders()
    this.store = store
    this.bridges = config.reduce((list, bridge) => {
      list[bridge.bridgeId] = bridge
      return list
    }, {} as { [k in BridgeList]: OmnibridgeChildBase })
  }

  public updateSigner = async (signerData: Omit<OmnibridgeChangeHandler, 'previousChainId'>) => {
    const previousChainId = this._activeChainId
    this._activeChainId = signerData.activeChainId

    const promises = (Object.keys(this.bridges) as BridgeList[]).map(bridgeKey => {
      return new Promise<string>(async (res, rej) => {
        try {
          await this.bridges[bridgeKey].onSignerChange({ previousChainId, ...signerData })
          res(bridgeKey)
        } catch (e) {
          rej(bridgeKey)
        }
      })
    })

    const updateStatus = await Promise.allSettled(promises)

    // TODO: What if update fails?
    updateStatus.forEach(res => {
      if (res.status === 'rejected') {
        console.warn(`Omni: failed to update ${res.reason}`)
      }
    })
  }

  public init = async ({ account, activeProvider, activeChainId }: OmnibridgeChangeHandler) => {
    if (this._initialized) return

    this._activeChainId = activeChainId

    const promises = (Object.keys(this.bridges) as BridgeList[]).map(bridgeKey => {
      return new Promise<string>(async (res, rej) => {
        try {
          await this.bridges[bridgeKey].init({
            account,
            activeChainId,
            activeProvider,
            staticProviders: this.staticProviders,
            store: this.store
          })
          res(bridgeKey)
        } catch (e) {
          rej(bridgeKey)
        }
      })
    })

    const initStatus = await Promise.allSettled(promises)

    // TODO: What if init fails?
    initStatus.forEach(res => {
      if (res.status === 'rejected') {
        console.warn(`Omni: failed to initiate ${res.reason}`)
      }
    })
    this._initialized = true
  }

  public getSupportedBridges = (from: ChainId, to: ChainId) => {
    const supportedBridges = (Object.keys(this.bridges) as BridgeList[]).reduce<
      { id: BridgeList; bridge: OmnibridgeChildBase; name: string }[]
    >((retVal, key) => {
      const supportedChains = this.bridges[key].supportedChains

      const match = from === supportedChains.from && to === supportedChains.to
      const matchReverse = supportedChains.reverse && from === supportedChains.to && to === supportedChains.from

      if (match || matchReverse) {
        retVal.push({
          id: key,
          bridge: this.bridges[key],
          name: this.bridges[key].displayName
        })
      }

      return retVal
    }, [])

    // filter by supported token

    return supportedBridges
  }

  public onSelectBridge = (bridgeId: BridgeList) => {
    if (!Object.keys(this.bridges).includes(bridgeId)) return
    this._activeBridgeId = bridgeId
  }

  // ADAPTERS
  public withdraw = async (value: string, tokenAddress?: string) => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].withdraw(value, tokenAddress)
  }

  public deposit = async (value: string, tokenAddress?: string) => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].deposit(value, tokenAddress)
  }

  public approve = async (erc20L1Address: string, gatewayAddress?: string, tokenSymbol?: string) => {
    if (!this._initialized || !this._activeBridgeId) return
    return this.bridges[this._activeBridgeId].approve(erc20L1Address, gatewayAddress, tokenSymbol)
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
