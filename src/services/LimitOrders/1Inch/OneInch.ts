import { TokenAmount } from '@swapr/sdk'

import { Kind, LimitOrderChangeHandler, OrderExpiresInUnit, ProtocolContructor, Token } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

export class OneInch extends LimitOrderBase {
  constructor({ supportedChains, protocol }: ProtocolContructor) {
    super({
      supportedChains,
      protocol,
      kind: Kind.Sell,
      expiresAt: 20,
    })
  }

  onSellTokenChange(sellToken: Token) {
    this.sellToken = sellToken
  }

  onBuyTokenChange(buyToken: Token) {
    this.buyToken = buyToken
  }

  onSellAmountChange(sellAmount: TokenAmount) {
    this.sellAmount = sellAmount
  }

  onBuyAmountChange(buyAmount: TokenAmount) {
    this.buyAmount = buyAmount
  }

  onLimitOrderChange(limitOrder: any): void {
    this.limitOrder = limitOrder
  }

  onExpireChange(expiresAt: number): void {
    this.expiresAt = expiresAt
  }

  onExpireUnitChange(unit: OrderExpiresInUnit): void {
    this.expiresAtUnit = unit
  }

  onKindChange(kind: Kind): void {
    this.kind = kind
  }

  setToMarket(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  getQuote(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  init(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async onSignerChange(_signer: LimitOrderChangeHandler) {
    // TODO: update protocol if needed
  }
  approve(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  createOrder(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async getMarketPrice() {
    return 0
  }
}
