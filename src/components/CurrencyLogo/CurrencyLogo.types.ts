import { ChainId, Currency } from '@swapr/sdk'

export enum CurrencyWrapperSource {
  SWAP,
  BRIDGE,
}

export interface CurrencyLogoComponentProps {
  size?: string
  style?: React.CSSProperties
  sources: string[]
  loading?: boolean
  currency?: Currency
  className?: string
  marginLeft?: number
  marginRight?: number
}

export interface CurrencyLogoContainerProps extends Omit<CurrencyLogoComponentProps, 'sources'> {
  chainIdOverride?: ChainId
  currencyWrapperSource?: CurrencyWrapperSource
}
