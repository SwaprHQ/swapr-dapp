import { parseUnits } from '@ethersproject/units'
import {
  OmnibridgeChildBaseConstructor,
  OmnibridgeChildBaseInit,
  OmnibridgeChangeHandler,
  OptionalBridgeList
} from '../Omnibridge.types'
import { OmnibridgeChildBase } from '../Omnibridge.utils'
// import { socketActions } from './Socket.reducer'
import { Quote } from './Socket.types'
import { SocketList } from '../Omnibridge.types'
import { socketSelectors } from './Socket.selectors'

export class SocketBridge extends OmnibridgeChildBase {
  constructor({ supportedChains, bridgeId, displayName = 'Socket' }: OmnibridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })
  }

  // private get actions() {
  //   return socketActions[this.bridgeId as SocketList]
  // }

  private get selectors() {
    return socketSelectors[this.bridgeId as SocketList]
  }

  private get store() {
    if (!this._store) throw new Error('Socket: No store set')
    return this._store
  }

  public init = async ({ account, activeChainId, activeProvider, staticProviders, store }: OmnibridgeChildBaseInit) => {
    this.setInitialEnv({ staticProviders, store })
    this.setSignerData({ account, activeChainId, activeProvider })
  }

  public onSignerChange = async ({ ...signerData }: OmnibridgeChangeHandler) => {
    this.setSignerData(signerData)
  }

  public collect = () => {
    return
  }
  public triggerCollect = () => {
    return {
      symbol: '',
      typedValue: '',
      fromChainId: 1,
      toChainId: 1
    }
  }
  public triggerBridging = () => {
    //TODO
    return
  }
  public approve = () => {
    //TODO
    return
  }
  public validate = async () => {
    console.log('validate')
    const route = this.selectors.selectRoute(this.store.getState())
    console.log(route)
    if (route === undefined) return
    const response = await fetch('https://backend.movr.network/v2/build-tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
      },
      body: JSON.stringify({ route: route })
    })
    const json = await response.json()
    console.log(json)
  }

  public getBridgingMetadata = async () => {
    return new Promise<{
      name: string
      bridgeId: OptionalBridgeList
      errors: {
        message: string
      }
      routes?: [
        {
          chainGasBalances: {
            [n in number]: {
              hasGasBalance: false
              minGasBalance: string
            }
          }
          fromAmount: string
          routeId: string
          sender: string
          serviceTime: number
          toAmount: string
          totalGasFeesInUsd: number
          totalUserTx: number
          usedBridgeNames: string[]
          userTxs: any
        }
      ]
      gas?: string
      fee?: string
      estimatedTime?: number | string
    }>(async resolve => {
      //check health socket server
      const response = await fetch('https://backend.movr.network/v2/health', {
        headers: {
          'Content-Type': 'application/json',
          'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37' //TODO hide api key
        }
      })
      const health: { ok: boolean } = await response.json()

      if (health.ok) {
        const { from, to } = this.store.getState().omnibridge.UI
        if (!from.address || Number(from.value) === 0) return

        const value = parseUnits(from.value, 18) //TODO get decimals from token list

        const response = await fetch(
          `https://backend.movr.network/v2/quote?fromChainId=${
            from.chainId
          }&fromTokenAddress=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&toChainId=${
            to.chainId
          }&toTokenAddress=0xff970a61a04b1ca14834a43f5de4533ebddb5cc8&fromAmount=${value.toString()}&userAddress=${
            this._account
          }&uniqueRoutesPerBridge=false&sort=output`,
          {
            headers: {
              'Content-Type': 'application/json',
              'API-KEY': 'f0211573-6dad-4a36-9a3a-f47012921a37'
            }
          }
        )
        const quote: Quote = await response.json()

        //todo  this.store.dispatch(this.actions.setRoutes({ id: this.bridgeId, name: this.displayName }))
        if (quote.success) {
          resolve({
            name: 'Socket',
            bridgeId: this.bridgeId,
            errors: {
              message: ''
            },
            routes: quote.result.routes
          })
        } else {
          resolve({
            name: 'Socket',
            bridgeId: this.bridgeId,
            errors: {
              message: 'Socket: cannot get routes'
            }
          })
        }
      } else {
        resolve({
          name: 'Socket',
          bridgeId: this.bridgeId,
          errors: {
            message: 'Socket: Server error'
          }
        })
      }
    })
  }
}
