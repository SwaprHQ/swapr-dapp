import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AbstractAdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { BasePair } from './adapters/baseAdapter/base.types'

export enum AdapterKeys {
  SWAPR = 'swapr',
  SUSHISWAP = 'sushiswap',
  UNISWAPV2 = 'uniswapV2',
  HONEYSWAP = 'honeyswap',
}

export type InitialState = {
  pair: {
    inputToken?: Token
    outputToken?: Token
  }
  adapters: {
    [AdapterKeys.SWAPR]: {
      [pairId: string]: BasePair | undefined
    }
    [AdapterKeys.SUSHISWAP]: {
      [pairId: string]: BasePair | undefined
    }
    [AdapterKeys.UNISWAPV2]: {
      [pairId: string]: BasePair | undefined
    }
    [AdapterKeys.HONEYSWAP]: {
      [pairId: string]: BasePair | undefined
    }
  }
}

export type AdvancedViewTransaction = {
  transactionId: string
  amountIn: string
  amountOut: string
  timestamp: string
  logoKey: string
  isSell?: boolean
  amountUSD?: string
  priceToken0?: string
  priceToken1?: string
}

export enum AdapterPayloadType {
  swaps = 'swaps',
  burnsAndMints = 'burnsAndMints',
}

export type AdvancedTradingViewAdapterConstructorParams<AppState> = {
  adapters: Adapters<AppState>
  chainId: ChainId
  store: Store<AppState>
}
export type AdapterInitialArguments<AppState> = Omit<
  AdvancedTradingViewAdapterConstructorParams<AppState>,
  'adapters' | 'amountOfPairTrades' | 'amountOfPairActivity'
>

export type Adapters<AppState> = { [key in AdapterKeys]: AbstractAdvancedTradingViewAdapter<AppState> }

export type AdapterFetchDetails = {
  inputToken: Token
  outputToken: Token
  amountToFetch: number
  isFirstFetch: boolean
  abortController: (id: string) => AbortSignal
}

export enum AdapterAmountToFetch {
  pairTrades = 50,
  pairActivity = 25,
}
