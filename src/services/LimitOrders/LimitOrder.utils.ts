import { Web3Provider } from '@ethersproject/providers'
import { ChainId, Currency, Token, TokenAmount } from '@swapr/sdk'

import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { CoWQuote } from './CoW/CoW.types'
import { LimitOrderBaseConstructor, WalletData, OrderExpiresInUnit, Kind, LimitOrder } from './LimitOrder.types'

export const logger = (message?: any, ...optionalParams: any[]) => {
  process.env.NODE_ENV === 'development' && console.log(message, ...optionalParams)
}

export abstract class LimitOrderBase {
  limitOrder: LimitOrder | undefined
  quote: CoWQuote | unknown
  userAddress: string | undefined
  receiverAddres: string | undefined
  sellToken: Token
  buyToken: Token
  sellAmount: TokenAmount
  buyAmount: TokenAmount
  limitPrice: string | undefined
  orderType?: 'partial' | 'full'
  quoteId: string | undefined
  kind?: Kind = Kind.Sell
  provider: Web3Provider | undefined
  expiresAt: number
  expiresAtUnit: OrderExpiresInUnit = OrderExpiresInUnit.Minutes
  createdAt: number | undefined
  limitOrderProtocol: 'CoW' | '1inch'
  supportedChanins: ChainId[]
  activeChainId: ChainId | undefined
  loading: boolean = false

  constructor({ protocol, supportedChains, kind, expiresAt, sellToken, buyToken }: LimitOrderBaseConstructor) {
    this.limitOrderProtocol = protocol
    this.supportedChanins = supportedChains
    this.kind = kind
    this.expiresAt = expiresAt
    this.sellToken = sellToken
    this.buyToken = buyToken
    this.sellAmount = new TokenAmount(sellToken, parseUnits('1', sellToken.decimals).toString())
    this.buyAmount = new TokenAmount(buyToken, parseUnits('1', buyToken.decimals).toString())
  }

  #logFormat = (message: string) => `LimitOrder:: ${this.limitOrderProtocol} : ${message}`

  logger = {
    log: (message: string, ...props: any[]) => logger(this.#logFormat(message), ...props),
    error: (message: string, ...props: any[]) => logger(this.#logFormat(message), ...props),
  }

  getTokenFromCurrency(currency: Currency): Token {
    let token = currency as Token
    if (this.activeChainId) {
      token = new Token(this.activeChainId, currency.address!, currency.decimals, currency.symbol)
    }
    return token
  }

  getFormattedAmount = (amount: TokenAmount) => {
    const rawAmount = formatUnits(amount.raw.toString(), amount.currency.decimals) || '0'
    const formattedAmount = parseFloat(rawAmount).toFixed(6)
    if (Number(formattedAmount) === 0) return Number(formattedAmount).toString()
    return formattedAmount.replace(/\.?0+$/, '')
  }

  setSignerData = async ({ account, activeChainId, provider }: WalletData) => {
    this.userAddress = account
    this.activeChainId = activeChainId
    this.provider = provider
    this.logger.log(`Signer data set for ${this.limitOrderProtocol}`)
  }

  abstract onSellTokenChange(sellToken: Currency): void
  abstract onBuyTokenChange(buyToken: Currency): void
  abstract onSellAmountChange(sellAmount: TokenAmount): void
  abstract onBuyAmountChange(buyAmount: TokenAmount): void
  abstract onLimitOrderChange(limitOrder: any): void
  abstract onExpireChange(expiresAt: number): void
  abstract onExpireUnitChange(unit: OrderExpiresInUnit): void
  abstract onKindChange(kind: Kind): void
  abstract onLimitPriceChange(limitPrice: string): void

  abstract getQuote(): Promise<void>
  abstract getMarketPrice(): Promise<number>
  abstract getTokenLimitPrices(): string
  abstract onSignerChange({ account, activeChainId, provider }: WalletData): Promise<void>
  abstract approve(): Promise<void>
  abstract createOrder(): Promise<void>
}
