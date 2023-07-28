import { Currency, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import { parseUnits } from 'ethers/lib/utils'

import { getDefaultTokens } from '../LimitOrder.config'
import { Kind, WalletData, OrderExpiresInUnit, ProtocolContructor, LimitOrder } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

import { getQuote } from './api/cow'
import { type CoWQuote } from './CoW.types'

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

  #abortControllers: { [id: string]: AbortController } = {}

  #renewAbortController = (key: string) => {
    console.log(this.#abortControllers[key])
    if (this.#abortControllers[key]) {
      this.#abortControllers[key].abort()
    }

    this.#abortControllers[key] = new AbortController()

    return this.#abortControllers[key].signal
  }

  #validateAmount(num: string | number): string {
    const numberValue = parseFloat(num.toString())
    return !isNaN(numberValue) && numberValue > 0 ? `${numberValue}` : '1'
  }

  async onSellTokenChange(sellToken: Currency) {
    this.loading = true
    this.sellToken = this.getTokenFromCurrency(sellToken)
    const exactAmount = this.#validateAmount(this.sellAmount.toExact())
    const sellAmountinWei = parseUnits(Number(exactAmount).toFixed(6), this.sellToken.decimals).toString()
    const sellAmount = new TokenAmount(this.sellToken, sellAmountinWei)
    this.#setSellAmount(sellAmount)

    this.onLimitOrderChange({
      sellToken: this.sellToken.address,
    })

    // this.onKindChange(Kind.Sell)

    await this.getQuote()
    this.loading = false
    this.logger.log(`Sell Token Change ${this.sellToken.symbol}`)
  }

  async onBuyTokenChange(buyToken: Currency) {
    this.loading = true
    this.buyToken = this.getTokenFromCurrency(buyToken)
    const exactAmount = this.#validateAmount(this.buyAmount.toExact())
    const buyAmountinWei = parseUnits(Number(exactAmount).toFixed(6), this.buyToken.decimals).toString()
    const buyAmount = new TokenAmount(this.buyToken, buyAmountinWei)
    this.#setBuyAmount(buyAmount)

    this.onLimitOrderChange({
      buyToken: this.buyToken.address,
    })

    // this.onKindChange(Kind.Buy)

    await this.getQuote()
    this.loading = false
    this.logger.log(`Buy Token Change ${this.buyToken.symbol}`)
  }

  async #onAmountChange() {
    if (this.buyToken === undefined || this.sellToken === undefined) return

    if (Number(this.limitPrice?.toString().trim()) > 0) {
      return
    }
    if (
      (this.kind === Kind.Sell && Number(this.sellAmount.toExact()) > 0) ||
      (this.kind === Kind.Buy && Number(this.buyAmount.toExact()) > 0)
    ) {
      await this.getQuote()
    }
  }

  #setSellAmount(sellAmount: TokenAmount) {
    this.sellAmount = sellAmount

    this.onLimitOrderChange({
      sellAmount: sellAmount.raw.toString(),
    })
  }

  async onSellAmountChange(sellAmount: TokenAmount) {
    this.#setSellAmount(sellAmount)

    await this.#onAmountChange()

    if (this.limitPrice && Number(this.limitPrice) > 0 && this.kind === Kind.Sell) {
      const buyAmount = parseFloat(this.sellAmount.toExact()) * parseFloat(this.limitPrice)
      this.#setBuyAmount(
        new TokenAmount(this.buyToken, parseUnits(buyAmount.toFixed(6), this.buyToken.decimals).toString())
      )
    }

    this.logger.log(`Sell Amount Change ${this.sellAmount.raw.toString()}`)
  }

  #setBuyAmount(buyAmount: TokenAmount) {
    this.buyAmount = buyAmount
    this.onLimitOrderChange({
      buyAmount: buyAmount.raw.toString(),
    })
  }
  async onBuyAmountChange(buyAmount: TokenAmount) {
    this.#setBuyAmount(buyAmount)

    await this.#onAmountChange()

    if (this.limitPrice && Number(this.limitPrice) > 0 && this.kind === Kind.Buy) {
      const sellAmount = parseFloat(this.buyAmount.toExact()) * parseFloat(this.limitPrice)
      this.#setSellAmount(
        new TokenAmount(this.sellToken, parseUnits(sellAmount.toFixed(6), this.sellToken.decimals).toString())
      )
    }

    this.logger.log(`Buy Amount Change ${this.sellAmount.raw.toString()}`)
  }

  onLimitOrderChange(limitOrder: Partial<LimitOrder>): void {
    const fullLimitOrder = this.#getLimitOrder(limitOrder)
    this.limitOrder = fullLimitOrder
  }

  onExpireChange(expiresAt: number): void {
    this.expiresAt = expiresAt
    this.onLimitOrderChange({
      expiresAt: dayjs().add(expiresAt, this.expiresAtUnit).unix(),
    })
  }

  onExpireUnitChange(unit: OrderExpiresInUnit): void {
    this.expiresAtUnit = unit
  }

  onKindChange(kind: Kind): void {
    this.kind = kind
    this.onLimitOrderChange({
      kind,
    })
  }

  onLimitPriceChange(limitPrice: string): void {
    this.limitPrice = limitPrice
    this.onLimitOrderChange({
      limitPrice,
    })
  }

  onUserUpadtedLimitPrice(status: boolean) {
    this.userUpdatedLimitPrice = status
  }

  async getQuote(limitOrder?: LimitOrder) {
    const signer = this.provider?.getSigner()
    const chainId = this.activeChainId
    const order = limitOrder ?? this.limitOrder
    const kind = this.kind
    if (!signer || !chainId || !order || !kind) {
      throw new Error('Missing required params')
    }
    if (order.sellAmount !== this.sellAmount.raw.toString()) {
      order.sellAmount = this.sellAmount.raw.toString()
    }
    if (order.buyAmount !== this.buyAmount.raw.toString()) {
      order.buyAmount = this.buyAmount.raw.toString()
    }

    order.kind = kind

    console.log('limit price', order.limitPrice)
    try {
      const cowQuote = await getQuote({
        chainId,
        signer,
        order: { ...order, expiresAt: dayjs().add(this.expiresAt, OrderExpiresInUnit.Minutes).unix() },
        signal: this.#renewAbortController('getQuote'),
      })

      this.quote = cowQuote as CoWQuote

      const {
        quote: { buyAmount, sellAmount },
      } = cowQuote

      if (this.userUpdatedLimitPrice) {
        return
      }

      const buyTokenAmount = new TokenAmount(this.buyToken, buyAmount)
      const sellTokenAmount = new TokenAmount(this.sellToken, sellAmount)
      this.quoteBuyAmount = buyTokenAmount
      this.quoteSellAmount = sellTokenAmount
      this.limitPrice = this.getLimitPrice()

      if (kind === Kind.Sell) {
        this.buyAmount = buyTokenAmount
        this.onLimitOrderChange({
          buyAmount: buyTokenAmount.raw.toString(),
        })
      } else {
        this.sellAmount = sellTokenAmount
        this.onLimitOrderChange({
          sellAmount: sellTokenAmount.raw.toString(),
        })
      }
    } catch (error: any) {
      // TODO: SHOW ERROR in UI
      this.logger.error(error.message)
    }
  }

  async onSignerChange({ activeChainId, account }: WalletData) {
    const { sellToken, buyToken } = getDefaultTokens(activeChainId)
    // Setting default tokens for ChainId's
    this.onSellTokenChange(sellToken)
    this.onBuyTokenChange(buyToken)
    // Setting default amounts for Tokens
    this.#setSellAmount(new TokenAmount(sellToken, parseUnits('1', sellToken.decimals).toString()))
    this.#setBuyAmount(new TokenAmount(buyToken, parseUnits('1', buyToken.decimals).toString()))
    this.onLimitOrderChange({
      kind: this.kind,
      expiresAt: this.expiresAt,
      sellToken: this.sellToken.address,
      buyToken: this.buyToken.address,
      sellAmount: this.sellAmount.raw.toString(),
      buyAmount: this.buyAmount.raw.toString(),
      userAddress: account,
      receiverAddress: account,
    })
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
      this.loading = true

      const tokenAmountSelected = kind === Kind.Sell ? this.sellAmount : this.buyAmount

      const order = structuredClone(limitOrder)
      const tokenSelected = kind === Kind.Sell ? sellToken : buyToken

      const tokenAmount =
        tokenAmountSelected && Number(tokenAmountSelected.toExact()) > 0 ? tokenAmountSelected.toExact() : '1'
      order.sellAmount = parseUnits(tokenAmount, tokenSelected.decimals).toString()

      await this.getQuote(order)
    }
  }

  #getLimitOrder(props: Partial<LimitOrder>): LimitOrder {
    const order = {
      ...this.limitOrder,
    }
    if (props.sellToken !== undefined) {
      order.sellToken = props.sellToken
    }
    if (props.buyToken !== undefined) {
      order.buyToken = props.buyToken
    }
    if (props.sellAmount !== undefined) {
      order.sellAmount = props.sellAmount
    }
    if (props.buyAmount !== undefined) {
      order.buyAmount = props.buyAmount
    }

    if (props.userAddress !== undefined) {
      order.userAddress = props.userAddress
    }
    if (props.receiverAddress !== undefined) {
      order.receiverAddress = props.receiverAddress
    }
    if (props.kind !== undefined) {
      order.kind = props.kind
    }
    if (props.expiresAt !== undefined) {
      order.expiresAt = props.expiresAt
    }
    if (props.limitPrice !== undefined) {
      order.limitPrice = props.limitPrice
    }

    if (props.feeAmount !== undefined) {
      order.feeAmount = props.feeAmount
    }
    if (props.createdAt !== undefined) {
      order.createdAt = props.createdAt
    }

    const {
      sellToken = this.sellToken.address,
      buyToken = this.buyToken.address,
      sellAmount = this.sellAmount.raw.toString() ?? '1000000000000000000',
      buyAmount = this.buyAmount.raw.toString() ?? '1000000000000000000',
      userAddress = this.userAddress,
      receiverAddress = this.userAddress,
      kind = this.kind,
      expiresAt = dayjs().add(this.expiresAt, OrderExpiresInUnit.Minutes).unix(),
      limitPrice = '1',
      feeAmount = '0',
      createdAt = dayjs().unix(),
    } = order

    if (
      !sellToken ||
      !buyToken ||
      !sellAmount ||
      !buyAmount ||
      !userAddress ||
      !receiverAddress ||
      !kind ||
      !expiresAt ||
      !limitPrice ||
      !feeAmount ||
      !createdAt
    ) {
      throw new Error('Missing properties in Limit Order params')
    }

    return {
      sellToken,
      buyToken,
      sellAmount,
      buyAmount,
      userAddress,
      receiverAddress,
      kind,
      expiresAt,
      limitPrice,
      feeAmount,
      createdAt,
    } as LimitOrder
  }

  getLimitPrice() {
    const [baseAmount, quoteAmount] =
      this.kind === Kind.Sell
        ? [this.quoteSellAmount, this.quoteBuyAmount]
        : [this.quoteBuyAmount, this.quoteSellAmount]
    const quoteAmountInUnits = parseFloat(quoteAmount.toExact())
    const baseAmountInUnits = parseFloat(baseAmount.toExact())
    if (
      !Number.isNaN(quoteAmountInUnits) &&
      quoteAmountInUnits > 0 &&
      !Number.isNaN(baseAmountInUnits) &&
      baseAmountInUnits > 0
    ) {
      return (parseFloat(quoteAmount.toExact()) / parseFloat(baseAmount.toExact())).toFixed(6)
    }
    this.getQuote()
    return '1'
  }
}
