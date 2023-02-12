import { EcoBridgeChangeHandler, EcoBridgeChildBaseConstructor } from '../EcoBridge.types'
import { EcoBridgeChildBase } from '../EcoBridge.utils'
import { LifiList } from './../EcoBridge.types'
import { lifiActions } from './Lifi.reducer'
import { LifiTokenMap } from './Lifi.types'

export class LifiBridge extends EcoBridgeChildBase {
  private _tokenLists: LifiTokenMap = {}

  constructor({ supportedChains, bridgeId, displayName = 'Lifi' }: EcoBridgeChildBaseConstructor) {
    super({ supportedChains, bridgeId, displayName })
    this.setBaseActions(this.actions)
  }

  private get actions() {
    return lifiActions[this.bridgeId as LifiList]
  }

  public collect = () => undefined
  public approve = () => undefined
  public init = async (data: any) => {
    return {} as Promise<void>
  }
  public fetchDynamicLists = () => {
    return {} as Promise<void>
  }
  public fetchStaticLists = () => {
    return {} as Promise<void>
  }
  public getBridgingMetadata = () => undefined
  public onSignerChange = async (data: EcoBridgeChangeHandler) => {
    return {} as Promise<void>
  }
  public triggerBridging = () => undefined
  public validate = () => undefined
}
