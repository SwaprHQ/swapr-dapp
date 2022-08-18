import { Price, TokenAmount } from '@swapr/sdk'

import { createContext } from 'react'

import { OrderExpiresInUnit, SerializableLimitOrder } from '../interfaces'

interface ILimitOrderFormContext {
  /**
   * The serializable limit order that is being edited.
   */
  limitOrder: SerializableLimitOrder
  setLimitOrder: (limitOrder: SerializableLimitOrder) => void

  /**
   * @todo remove
   */
  price: Price
  setPrice: (price: Price) => void

  /**
   * Sell token amount
   */
  sellTokenAmount: TokenAmount
  setSellTokenAmount: (sellCurrencyAmount: TokenAmount) => void

  /**
   * Buy Token Amount
   */
  buyTokenAmount: TokenAmount
  setBuyTokenAmount: (buyTokenAmount: TokenAmount) => void

  /**
   * display limit price
   */
  formattedLimitPrice: string
  setFormattedLimitPrice: (formattedLimitPrice: string) => void

  /**
   * Display buy token
   */
  formattedBuyAmount: string
  setFormattedBuyAmount: (formattedBuyAmount: string) => void

  /**
   * order expiry
   */
  expiresIn: number
  setExpiresIn: (expiresIn: number) => void
  expiresInUnit: OrderExpiresInUnit
  setExpiresInUnit: (expiresInUnit: OrderExpiresInUnit) => void
}

export const LimitOrderFormContext = createContext<ILimitOrderFormContext>({} as ILimitOrderFormContext)
