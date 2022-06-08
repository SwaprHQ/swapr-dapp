// eslint-disable-next-line
import type { Trade, CurrencyAmount, Currency, Percent } from '@swapr/sdk'

export interface EcoRouterResults {
  trades: Trade[]
  errors: any[]
}

export interface EcoRouterHookResults extends EcoRouterResults {
  loading: boolean
}

export interface EcoRouterHookCommonParams {
  // Receiver address
  receiver?: string
  // Allowed percentage
  maximumSlippage: Percent
}

export interface EcoRouterBestExactInParams extends EcoRouterHookCommonParams {
  currencyAmountIn: CurrencyAmount
  currencyOut: Currency
}

export interface EcoRouterBestExactOutParams extends EcoRouterHookCommonParams {
  currencyAmountOut: CurrencyAmount
  currencyIn: Currency
}

export interface EcoRouterSourceOptionsParams {
  uniswapV2: {
    useMultihops?: boolean
  }
}
