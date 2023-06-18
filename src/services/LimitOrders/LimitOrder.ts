import { limitOrderConfig } from './LimitOrder.config'
import { WalletData } from './LimitOrder.types'
import { LimitOrderBase } from './LimitOrder.utils'

export default class LimitOrder {
  #protocols: LimitOrderBase[]
  activeProtocol?: LimitOrderBase

  constructor() {
    console.log('LimitOrder constructor')
    this.#protocols = limitOrderConfig
  }

  updateSigner = async (signerData: WalletData) => {
    console.log('LimitOrder updateSigner')
    await Promise.all(
      Object.values(this.#protocols).map(async protocol => {
        await protocol.setSignerData(signerData)
        await protocol.onSignerChange(signerData)
      })
    )
    this.#setActiveProtocol()
  }

  #setActiveProtocol() {
    console.log('LimitOrder set Active Protocol')
    this.activeProtocol = this.#protocols.find(
      protocol => protocol.activeChainId && protocol.supportedChanins.includes(protocol.activeChainId)
    )
  }

  getActiveProtocol = () => {
    console.log('LimitOrder get Active Protocol')
    return this.activeProtocol
  }
}
