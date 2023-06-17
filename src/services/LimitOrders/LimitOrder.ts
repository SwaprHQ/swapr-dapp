import { limitOrderConfig } from './LimitOrder.config'
import { LimitOrderChangeHandler } from './LimitOrder.types'
import { LimitOrderBase } from './LimitOrder.utils'

export default class LimitOrder {
  #protocols: LimitOrderBase[]
  activeProtocol?: LimitOrderBase

  constructor() {
    console.log('LimitOrder constructor')
    this.#protocols = limitOrderConfig
  }

  updateSigner = async (signerData: LimitOrderChangeHandler) => {
    console.log('LimitOrder updateSigner')
    await Promise.all(
      Object.values(this.#protocols).map(async protocol => {
        await protocol.setSignerData(signerData)
        await protocol.onSignerChange(signerData)
      })
    )
  }

  getActiveProtocol = () => {
    console.log('LimitOrder getactiveProtocols')
    this.activeProtocol = this.#protocols.find(
      protocol => protocol.activeChainId && protocol.supportedChanins.includes(protocol.activeChainId)
    )
    return this.activeProtocol
  }
}
