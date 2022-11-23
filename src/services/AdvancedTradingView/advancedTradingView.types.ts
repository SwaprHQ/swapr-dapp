import { ChainId, Token } from '@swapr/sdk'

import { Store } from '@reduxjs/toolkit'

import { AbstractAdvancedTradingViewAdapter } from './adapters/advancedTradingView.adapter'
import { BasePair } from './adapters/baseAdapter/base.types'
import { UniswapV3Pair } from './adapters/uniswapV3/uniswapV3.types'

export enum AdapterKey {
  SWAPR = 'swapr',
  SUSHISWAP = 'sushiswap',
  UNISWAPV2 = 'uniswapV2',
  HONEYSWAP = 'honeyswap',
  UNISWAPV3 = 'uniswapV3',
}

export type AdapterType = {
  [AdapterKey.SWAPR]: {
    [pairId: string]: BasePair | undefined
  }
  [AdapterKey.SUSHISWAP]: {
    [pairId: string]: BasePair | undefined
  }
  [AdapterKey.UNISWAPV2]: {
    [pairId: string]: BasePair | undefined
  }
  [AdapterKey.HONEYSWAP]: {
    [pairId: string]: BasePair | undefined
  }
  [AdapterKey.UNISWAPV3]: {
    [pairId: string]: UniswapV3Pair | undefined
  }
}

export type InitialState = {
  pair: {
    inputToken?: Token
    outputToken?: Token
  }
  adapters: AdapterType
}

export type AdvancedViewTransaction = {
  transactionId: string
  amountIn: string
  amountOut: string
  timestamp: string
  logoKey: string
  isSell?: boolean
  amountUSD: string
  priceToken0?: string
  priceToken1?: string
}

export enum AdapterPayloadType {
  SWAPS = 'swaps',
  BURNS_AND_MINTS = 'burnsAndMints',
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

export type Adapters<AppState> = { [key in AdapterKey]: AbstractAdvancedTradingViewAdapter<AppState> }

export type AdapterFetchDetails = {
  inputToken: Token
  outputToken: Token
  amountToFetch: number
  isFirstFetch?: boolean
  abortController: (id: string) => AbortSignal
  refreshing?: boolean
}

export type AdapterFetchDetailsExtended = AdapterFetchDetails & { dataType: AdapterPayloadType }

export enum AdapterAmountToFetch {
  PAIR_TRADES = 10,
  PAIR_ACTIVITY = 3,
  LIMIT = 30,
}

export type AdapterFetchMethodArguments = Pick<AdapterFetchDetails, 'abortController' | 'amountToFetch'> & {
  pairId: string
  pair?: BasePair | UniswapV3Pair | undefined
  chainId: ChainId.MAINNET | ChainId.ARBITRUM_ONE | ChainId.GNOSIS | ChainId.POLYGON | ChainId.OPTIMISM_MAINNET
  inputTokenAddress: string
  outputTokenAddress: string
  refreshing?: boolean
}
