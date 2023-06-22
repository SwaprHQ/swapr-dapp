import { Currency, TokenAmount } from '@swapr/sdk'

import dayjs from 'dayjs'
import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { getQuote } from '../../../pages/Swap/LimitOrder/api/cow'
import { getDefaultTokens } from '../LimitOrder.config'
import { Kind, WalletData, OrderExpiresInUnit, ProtocolContructor, LimitOrder } from '../LimitOrder.types'
import { LimitOrderBase } from '../LimitOrder.utils'

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

  onSellTokenChange(sellToken: Currency) {
    this.sellToken = this.getTokenFromCurrency(sellToken)
    this.onLimitOrderChange({
      sellToken: this.sellToken.address,
    })
    this.logger.log(`Sell Token Change ${this.sellToken.symbol}`)
  }

  onBuyTokenChange(buyToken: Currency) {
    this.buyToken = this.getTokenFromCurrency(buyToken)

    this.onLimitOrderChange({
      buyToken: this.buyToken.address,
    })
    this.logger.log(`Buy Token Change ${this.buyToken.symbol}`)
  }

  onSellAmountChange(sellAmount: TokenAmount) {
    this.sellAmount = sellAmount
    this.onLimitOrderChange({
      sellAmount: sellAmount.raw.toString(),
    })
    this.logger.log(`Sell Amount Change ${this.sellAmount.raw.toString()}`)
  }

  onBuyAmountChange(buyAmount: TokenAmount) {
    this.buyAmount = buyAmount
    this.onLimitOrderChange({
      buyAmount: buyAmount.raw.toString(),
    })

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

  async setToMarket(_sellPricePercentage: number, _buyPricePercentage: number): Promise<void> {
    const sellToken = this.sellToken
    const buyToken = this.buyToken
    if (!sellToken || !buyToken) {
      return
    }
    let tokenAmount = this.kind === Kind.Sell ? this.sellAmount : this.buyAmount
    if (!tokenAmount) {
      return
    }
    const validatedTokenAmount = Number(tokenAmount.toExact()) > 1 ? tokenAmount.toExact() : '1'
    const sellAmount = parseUnits(validatedTokenAmount, tokenAmount.currency.decimals).toString()

    if (this.limitOrder !== undefined) {
      const limitOrder = {
        ...this.limitOrder,
        sellAmount,
      }

      await this.getQuote(limitOrder)
      if (!this.quote) {
        throw new Error('No quote')
      }
      const {
        quote: { buyAmount: buyAmountQuote, sellAmount: sellAmountQuote },
      } = this.quote as CoWQuote

      this.logger.log('buyAmountQuote', buyAmountQuote)
      this.logger.log('sellAmountQuote', sellAmountQuote)
    }
  }

  async getQuote(limitOrder?: LimitOrder): Promise<void> {
    const signer = this.provider?.getSigner()
    const chainId = this.activeChainId
    const order = limitOrder ?? this.limitOrder
    const kind = this.kind
    if (!signer || !chainId || !order || !kind) {
      throw new Error('Missing required params')
    }
    try {
      const cowQuote = await getQuote({
        chainId,
        signer,
        order: { ...order },
      })
      this.quote = cowQuote as CoWQuote
    } catch (error: any) {
      this.logger.error(error.message)
    } finally {
      this.loading = false
    }
  }

  async onSignerChange({ activeChainId, account }: WalletData) {
    const { sellToken, buyToken } = getDefaultTokens(activeChainId)
    // Setting default tokens for ChainId's
    this.onSellTokenChange(sellToken)
    this.onBuyTokenChange(buyToken)
    // Setting default amounts for Tokens
    this.onSellAmountChange(new TokenAmount(sellToken, parseUnits('1', sellToken.decimals).toString()))
    this.onBuyAmountChange(new TokenAmount(buyToken, parseUnits('1', buyToken.decimals).toString()))
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
      const order = structuredClone(limitOrder)
      const tokenAmountSelected = kind === Kind.Sell ? this.sellAmount : this.buyAmount
      const tokenSelected = kind === Kind.Sell ? sellToken : buyToken

      const tokenAmount =
        tokenAmountSelected && Number(tokenAmountSelected.toExact()) > 1 ? tokenAmountSelected.toExact() : '1'

      order.sellAmount = parseUnits(tokenAmount, tokenSelected.decimals).toString()

      await this.getQuote({ ...order, expiresAt: dayjs().add(this.expiresAt, OrderExpiresInUnit.Minutes).unix() })

      const {
        quote: { buyAmount, sellAmount },
      } = this.quote as CoWQuote
      if (kind === Kind.Sell) {
        this.onBuyAmountChange(new TokenAmount(buyToken, buyAmount))
        return this.#formatMarketPrice(buyAmount, buyToken.decimals, tokenAmount)
      } else {
        this.onSellAmountChange(new TokenAmount(sellToken, sellAmount))
        return this.#formatMarketPrice(sellAmount, sellToken.decimals, tokenAmount)
      }
    }
    return 0
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

  #formatMarketPrice(amount: string, decimals: number, tokenAmount: string) {
    return parseFloat(formatUnits(amount, decimals) ?? 0) / Number(tokenAmount)
  }
}
