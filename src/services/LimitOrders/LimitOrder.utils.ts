import { Web3Provider } from '@ethersproject/providers'
import { ChainId, Currency, TokenAmount } from '@swapr/sdk'

import { LimitOrderBaseConstructor, LimitOrderChangeHandler, OrderExpiresInUnit, Kind } from './LimitOrder.types'

export abstract class LimitOrderBase {
  limitOrder: any
  quote: any
  userAddress: string | undefined
  receiverAddres: string | undefined
  sellToken: Currency | undefined
  buyToken: Currency | undefined
  sellAmount: TokenAmount | undefined
  buyAmount: TokenAmount | undefined
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

  constructor({ protocol, supportedChains, kind, expiresAt }: LimitOrderBaseConstructor) {
    this.limitOrderProtocol = protocol
    this.supportedChanins = supportedChains
    this.kind = kind
    this.expiresAt = expiresAt
    this.limitOrder = {
      kind: kind,
      expiresAt: expiresAt,
    }
  }

  #log = (message: string) => `LimitOrder:: ${this.limitOrderProtocol} : ${message}`

  #logger = {
    log: (message: string) => console.log(this.#log(message)),
    error: (message: string) => console.error(this.#log(message)),
  }

  setSignerData = async ({ account, activeChainId, activeProvider }: LimitOrderChangeHandler) => {
    this.userAddress = account
    this.activeChainId = activeChainId
    this.provider = activeProvider
    this.#logger.log(`Signer data set for ${this.limitOrderProtocol}`)
  }

  abstract onSellTokenChange(sellToken: Currency): void
  abstract onBuyTokenChange(buyToken: Currency): void
  abstract onSellAmountChange(sellAmount: TokenAmount): void
  abstract onBuyAmountChange(buyAmount: TokenAmount): void
  abstract onLimitOrderChange(limitOrder: any): void
  abstract onExpireChange(expiresAt: number): void
  abstract onExpireUnitChange(unit: OrderExpiresInUnit): void

  abstract getQuote(): Promise<void>
  abstract getMarketPrice(): Promise<number>
  abstract setToMarket(sellPricePercentage: number, buyPricePercentage: number): Promise<void>
  abstract onSignerChange({ account, activeChainId, activeProvider }: LimitOrderChangeHandler): Promise<void>
  abstract approve(): Promise<void>
  abstract createOrder(): Promise<void>
}
