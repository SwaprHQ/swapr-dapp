import { Currency, TokenAmount } from '@swapr/sdk'

import { parseUnits } from 'ethers/lib/utils'

import { getDefaultTokens } from '../LimitOrder.config'
import { Kind, WalletData, OrderExpiresInUnit, ProtocolContructor } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

export class OneInch extends LimitOrderBase {
  constructor({ supportedChains, protocol, sellToken, buyToken }: ProtocolContructor) {
    super({
      supportedChains,
      protocol,
      kind: Kind.Sell,
      expiresAt: 20,
      sellToken,
      buyToken,
    })
  }

  onSellTokenChange(sellToken: Currency) {
    this.sellToken = this.getTokenFromCurrency(sellToken)
  }

  onBuyTokenChange(buyToken: Currency) {
    this.buyToken = this.getTokenFromCurrency(buyToken)
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

  onLimitPriceChange(limitPrice: string): void {
    this.limitPrice = limitPrice
  }

  // setToMarket(): Promise<void> {
  //   throw new Error('Method not implemented.')
  // }

  getQuote(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  init(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  async onSignerChange({ activeChainId }: WalletData) {
    const { sellToken, buyToken } = getDefaultTokens(activeChainId)
    this.onSellTokenChange(sellToken)
    this.onBuyTokenChange(buyToken)
    this.onSellAmountChange(new TokenAmount(sellToken, parseUnits('1', sellToken.decimals).toString()))
    this.onBuyAmountChange(new TokenAmount(buyToken, parseUnits('1', buyToken.decimals).toString()))
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
  getTokenLimitPrices() {
    return '0'
  }
}
