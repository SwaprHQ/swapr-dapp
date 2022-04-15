import { ChainId, Currency } from '@swapr/sdk'

export enum CurrencyWrapperSource {
  SWAP,
  BRIDGE
}

export interface CurrencyLogoComponentProps {
  currency?: Currency
  size?: string
  style?: React.CSSProperties
  className?: string
  loading?: boolean
  marginRight?: number
  marginLeft?: number
  sources: string[]
}

export interface CurrencyLogoContainerProps extends Omit<CurrencyLogoComponentProps, 'sources'> {
  currencyWrapperSource?: CurrencyWrapperSource
  chainIdOverride?: ChainId
}
