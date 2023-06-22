import { limitOrderConfig } from './LimitOrder.config'
import { WalletData } from './LimitOrder.types'
import { LimitOrderBase, logger } from './LimitOrder.utils'

export default class LimitOrder {
  #protocols: LimitOrderBase[]
  activeProtocol?: LimitOrderBase

  constructor() {
    logger('LimitOrder constructor')
    this.#protocols = limitOrderConfig
  }

  updateSigner = async (signerData: WalletData) => {
    logger('LimitOrder updateSigner')
    await Promise.all(
      Object.values(this.#protocols).map(async protocol => {
        await protocol.setSignerData(signerData)
        await protocol.onSignerChange(signerData)
      })
    )
    this.#setActiveProtocol()
  }

  #setActiveProtocol() {
    logger('LimitOrder set Active Protocol')
    this.activeProtocol = this.#protocols.find(
      protocol => protocol.activeChainId && protocol.supportedChanins.includes(protocol.activeChainId)
    )
  }

  getActiveProtocol = () => {
    logger('LimitOrder get Active Protocol')
    return this.activeProtocol
  }
}
