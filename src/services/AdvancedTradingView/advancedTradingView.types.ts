import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AbstractAdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'

type LiquidityTransaction = {
  id: string
  transaction: {
    id: string
  }
  amount0: string
  amount1: string
  amountUSD: string
  timestamp: string
}

type TradesHistory = {
  amount0In: string
  amount0Out: string
  amount1In: string
  amount1Out: string
  amountUSD: string
  id: string
  timestamp: string
  transaction: { id: string }
}

export type InitialState = {
  pair: {
    inputToken?: Token
    outputToken?: Token
  }
  adapters: {
    swapr: {
      pair: {
        id?: string
        swaps: TradesHistory[]
        burnsAndMints: LiquidityTransaction[]
      }
      fetchDetails: {
        hasMoreTrades: boolean
        hasMoreActivity: boolean
      }
    }
  }
}

export type AdvancedViewTradeHistory = {
  transactionId: string
  amountIn: string
  amountOut: string
  timestamp: string
  logoKey: string
  isSell?: boolean
  amountUSD?: string
  price?: string
}

// adapters types
export enum AdapterKeys {
  SWAPR = 'swapr',
}

export type AdvancedTradingViewAdapterConstructorParams = {
  adapters: Adapters
  chainId: ChainId
  store: Store<AppState>
}

export type Adapters = { [key in AdapterKeys]: AbstractAdvancedTradingViewAdapter }

export type AdapterInitialArguments = Omit<AdvancedTradingViewAdapterConstructorParams, 'adapters'>

// swapr query type
export type SwaprTrades = {
  pair: {
    swaps: TradesHistory[]
  } | null
}

export type SwaprActivity = {
  pair: {
    burns: LiquidityTransaction[]
    mints: LiquidityTransaction[]
  } | null
}
