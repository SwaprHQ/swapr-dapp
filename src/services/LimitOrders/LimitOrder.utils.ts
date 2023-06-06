import { ChainId } from '@swapr/sdk'

import { ERC20Token, LimitOrderBaseConstructor, NativeToken, TokenAmount } from './LimitOrder.types'

export abstract class LimitOrderBase {
  userAddress: string
  receiverAddress: string
  sellToken: ERC20Token | NativeToken
  buyToken?: ERC20Token | NativeToken
  sellAmount?: TokenAmount
  buyAmount?: TokenAmount
  limitPrice?: string
  orderType: 'partial' | 'full'
  quoteId?: string
  kind: 'buy' | 'sell'
  expiresAt?: number
  createdAt?: number
  limitOrderProvider?: 'CoW' | '1inch'
  supportedChanins: ChainId[]

  constructor({
    userAddress,
    receiverAddress,
    sellToken,
    orderType = 'partial',
    kind = 'buy',
    provider,
    supportedChains,
  }: LimitOrderBaseConstructor) {
    this.userAddress = userAddress
    this.receiverAddress = receiverAddress
    this.sellToken = sellToken
    this.orderType = orderType
    this.kind = kind
    this.limitOrderProvider = provider
    this.supportedChanins = supportedChains
  }

  #log = (message: string) => `LimitOrder:: ${this.limitOrderProvider} : ${message}`

  #logger = {
    log: (message: string) => console.log(this.#log(message)),
    error: (message: string) => console.error(this.#log(message)),
  }

  abstract getQuote(): Promise<void>
  abstract init(): Promise<void>
  abstract onSignerChange(): Promise<void>
  abstract approve(): Promise<void>
  abstract createOrder(): Promise<void>
}
