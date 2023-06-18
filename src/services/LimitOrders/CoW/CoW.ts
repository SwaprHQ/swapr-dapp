import { Currency, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { getQuote } from '../../../pages/Swap/LimitOrder/api/cow'
import { getDefaultTokens } from '../LimitOrder.config'
import { Kind, WalletData, OrderExpiresInUnit, ProtocolContructor } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

export class CoW extends LimitOrderBase {
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
    this.limitOrder = {
      ...this.limitOrder,
      sellToken: this.sellToken,
    }
    this.logger.log(`Sell Token Change ${this.sellToken.symbol}`)
  }

  onBuyTokenChange(buyToken: Currency) {
    this.buyToken = this.getTokenFromCurrency(buyToken)
    this.limitOrder = {
      ...this.limitOrder,
      buyToken: this.buyToken,
    }
    this.logger.log(`Buy Token Change ${this.buyToken.symbol}`)
  }

  onSellAmountChange(sellAmount: TokenAmount) {
    this.sellAmount = sellAmount
    this.limitOrder = {
      ...this.limitOrder,
      sellAmount,
    }
    this.logger.log(`Sell Amount Change ${this.sellAmount.raw.toString()}`)
  }

  onBuyAmountChange(buyAmount: TokenAmount) {
    this.buyAmount = buyAmount
    this.limitOrder = {
      ...this.limitOrder,
      buyAmount,
    }
    this.logger.log(`Buy Amount Change ${this.sellAmount.raw.toString()}`)
  }

  onLimitOrderChange(limitOrder: any): void {
    this.limitOrder = limitOrder
  }

  onExpireChange(expiresAt: number): void {
    // TODO: Convert expiresAt based on expiresAtUnit
    this.expiresAt = expiresAt
    this.limitOrder = {
      ...this.limitOrder,
      expiresAt,
    }
  }

  onExpireUnitChange(unit: OrderExpiresInUnit): void {
    this.expiresAtUnit = unit
  }

  onKindChange(kind: Kind): void {
    this.kind = kind
    this.limitOrder = {
      ...this.limitOrder,
      kind,
    }
  }

  async setToMarket(_sellPricePercentage: number, _buyPricePercentage: number): Promise<void> {
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

    this.logger.log('buyAmountQuote', buyAmountQuote)
    this.logger.log('sellAmountQuote', sellAmountQuote)
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

  async onSignerChange({ activeChainId }: WalletData) {
    const { sellToken, buyToken } = getDefaultTokens(activeChainId)
    // Setting default tokens for ChainId's
    this.onSellTokenChange(sellToken)
    this.onBuyTokenChange(buyToken)
    // Setting default amounts for Tokens
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
    const { buyToken, sellToken, provider, limitOrder, kind, activeChainId } = this

    if (buyToken && sellToken && provider && limitOrder && activeChainId) {
      const order = structuredClone(limitOrder)
      const tokenAmountSelected = kind === Kind.Sell ? this.sellAmount : this.buyAmount
      const tokenSelected = kind === Kind.Sell ? sellToken : buyToken

      const tokenAmount =
        tokenAmountSelected && Number(tokenAmountSelected.toExact()) > 1 ? tokenAmountSelected.toExact() : '1'

      order.sellAmount = parseUnits(tokenAmount, tokenSelected.decimals).toString()

      await this.getQuote({ ...order, expiresAt: dayjs().add(20, OrderExpiresInUnit.Minutes).unix() })

      const { buyAmount, sellAmount } = this.quote
      if (kind === Kind.Sell) {
        return this.#formatMarketPrice(buyAmount, buyToken.decimals, tokenAmount)
      } else {
        return this.#formatMarketPrice(sellAmount, sellToken.decimals, tokenAmount)
      }
    }
    return 0
  }

  #formatMarketPrice(amount: string, decimals: number, tokenAmount: string) {
    return parseFloat(formatUnits(amount, decimals) ?? 0) / Number(tokenAmount)
  }
}
