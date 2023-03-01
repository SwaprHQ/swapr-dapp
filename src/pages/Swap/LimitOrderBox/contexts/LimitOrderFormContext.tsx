import { CurrencyAmount, TokenAmount } from '@swapr/sdk'

import { createContext, Dispatch, SetStateAction } from 'react'

import { OrderExpiresInUnit, SerializableLimitOrder } from '../interfaces'
import { InputFocus } from '../interfaces/order.interface'

interface ILimitOrderFormContext {
  /**
   * The serializable limit order that is being edited.
   */
  limitOrder: SerializableLimitOrder
  setLimitOrder: Dispatch<SetStateAction<SerializableLimitOrder>>

  /**
   * Sell token amount
   */
  sellTokenAmount: TokenAmount
  setSellTokenAmount: Dispatch<SetStateAction<TokenAmount>>

  /**
   * Buy Token Amount
   */
  buyTokenAmount: TokenAmount
  setBuyTokenAmount: Dispatch<SetStateAction<TokenAmount>>

  /**
   * display limit price
   */
  formattedLimitPrice: string
  setFormattedLimitPrice: Dispatch<SetStateAction<string>>

  /**
   * Display sell token
   */
  formattedSellAmount: string
  setFormattedSellAmount: Dispatch<SetStateAction<string>>
  /**
   * Display buy token
   */
  formattedBuyAmount: string
  setFormattedBuyAmount: Dispatch<SetStateAction<string>>

  /**
   * order expiry
   */
  expiresIn: number
  setExpiresIn: Dispatch<SetStateAction<number>>
  expiresInUnit: OrderExpiresInUnit
  setExpiresInUnit: Dispatch<SetStateAction<OrderExpiresInUnit>>

  /**
   * input focus
   */
  inputFocus: InputFocus
  setInputFocus: Dispatch<SetStateAction<InputFocus>>

  fiatValueInput: CurrencyAmount | null
  fiatValueOutput: CurrencyAmount | null
  isFallbackFiatValueInput: boolean
  isFallbackFiatValueOutput: boolean
}

export const LimitOrderFormContext = createContext<ILimitOrderFormContext>({} as ILimitOrderFormContext)
