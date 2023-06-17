import { TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import { parseUnits } from 'ethers/lib/utils'

import { getQuote } from '../../../pages/Swap/LimitOrderBox/api/cow'
import { Kind, LimitOrderChangeHandler, OrderExpiresInUnit, ProtocolContructor, Token } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

export class CoW extends LimitOrderBase {
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

  async setToMarket(sellPricePercentage: number, buyPricePercentage: number): Promise<void> {
    const sellToken = this.sellToken
    const buyToken = this.buyToken
    if (!sellToken || !buyToken) {
      return
    }
    let tokenAmount = this.kind === 'sell' ? this.sellAmount : this.buyAmount
    if (!tokenAmount) {
      return
    }
    const validatedTokenAmount = Number(tokenAmount.toExact()) > 1 ? tokenAmount.toExact() : '1'
    const sellAmount = parseUnits(validatedTokenAmount, tokenAmount.currency.decimals).toString()

    const limitOrder = {
      ...this.limitOrder,
      sellAmount,
    }

    await this.getQuote(limitOrder)
    if (!this.quote) {
      throw new Error('No quote')
    }
    const { buyAmount: buyAmountQuote, sellAmount: sellAmountQuote } = this.quote

    console.log('buyAmountQuote', buyAmountQuote)
    console.log('sellAmountQuote', sellAmountQuote)
  }

  async getQuote(limitOrder?: any): Promise<void> {
    const signer = this.provider?.getSigner()
    const chainId = this.activeChainId
    const order = limitOrder ?? this.limitOrder
    const expiresAt = dayjs().add(this.expiresAt, 'minutes').unix()
    const kind = this.kind
    if (!signer || !chainId || !limitOrder || !expiresAt || !kind) {
      throw new Error('Missing required params')
    }
    const cowQuote = await getQuote({
      chainId,
      signer,
      order: { ...order, expiresAt },
    })

    this.quote = cowQuote
  }

  async onSignerChange(_signer: LimitOrderChangeHandler) {
    // this.userAddress = account
    // this.activeChainId = activeChainId
    // this.provider = activeProvider
    // TODO: update protocol if needed
  }

  approve(): Promise<void> {
    throw new Error('Method not implemented.')
  }
  createOrder(): Promise<void> {
    throw new Error('Method not implemented.')
  }
}
