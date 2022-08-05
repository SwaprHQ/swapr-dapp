import { ChainId } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AbstractTradesAdapter } from './adapters/trades.adapter'

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

// trades adapter store
export type InitialState = {
  pair: {
    fromTokenAddress?: string
    toTokenAddress?: string
  }
  sources: {
    swapr: {
      transactions: SwaprTradesHistory | undefined
      loading: boolean
    }
  }
}

export type TradeHistory = {
  transactionId: string
  amountIn: string
  amountOut: string
  timestamp: string
  logoKey: string
  isSell?: boolean
  amountUSD?: string
}

// adapters types
export enum AdapterKeys {
  SWAPR = 'swapr',
}

export type TradesHistoryAdapterConstructorParams = {
  adapters: Adapters
  chainId: ChainId
  store: Store<AppState>
}

export type Adapters = { [key in AdapterKeys]: AbstractTradesAdapter }

export type AdapterInitialArguments = Omit<TradesHistoryAdapterConstructorParams, 'adapters'>

// adapter transaction type
export type SwaprTradesHistory = {
  pair: {
    id: string
    token0: {
      id: string
      symbol: string
    }
    token1: {
      id: string
      symbol: string
    }
    burns: LiquidityTransaction[]
    mints: LiquidityTransaction[]
    swaps: TradesHistory[]
  } | null
}
