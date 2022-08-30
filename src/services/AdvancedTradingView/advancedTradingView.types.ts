import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AppState } from '../../state'
import { AbstractAdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { SwaprPair } from './adapters/swapr/swapr.types'

export type InitialState = {
  pair: {
    currentTradeToggleToken?: Token
    inputToken?: Token
    outputToken?: Token
  }
  adapters: {
    swapr: {
      [pairId: string]: SwaprPair | undefined
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

export enum AdapterKeys {
  SWAPR = 'swapr',
}

export enum AdapterPayloadType {
  swaps = 'swaps',
  burnsAndMints = 'burnsAndMints',
}

export type AdvancedTradingViewAdapterConstructorParams = {
  adapters: Adapters
  chainId: ChainId
  store: Store<AppState>
}
export type AdapterInitialArguments = Omit<
  AdvancedTradingViewAdapterConstructorParams,
  'adapters' | 'amountOfPairTrades' | 'amountOfPairActivity'
>

export type Adapters = { [key in AdapterKeys]: AbstractAdvancedTradingViewAdapter }

export type AdapterFetchDetails = {
  inputToken: Token
  outputToken: Token
  amountToFetch: number
  isFirstFetch: boolean
}

export enum AdapterAmountToFetch {
  pairTrades = 50,
  pairActivity = 25,
}
