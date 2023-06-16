import { TokenAmount } from '@swapr/sdk'

import { ProtocolContructor, Token } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

export class OneInch extends LimitOrderBase {
  constructor({ supportedChains, protocol }: ProtocolContructor) {
    super({
      supportedChains,
      protocol,
      kind: 'sell',
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

  onKindChange(kind: 'buy' | 'sell'): void {
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
  onSignerChange(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  approve(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  createOrder(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
