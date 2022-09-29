import { Trade } from '@swapr/sdk'

import { createContext } from 'react'

import { Fathom } from '../fathom'
import { FathomSiteInformation } from '../generated/prod'

export interface TrackEcoRouterVolumeUSDParams {
  protocolName: string
  networkId: number
  volumeUSD: string
}

export interface IAnalyticsContext {
  site: FathomSiteInformation
  fathom: Fathom
  /**
   * Track the volume of a trade in USD and send it to Fathom
   */
  trackEcoEcoRouterTradeVolume(trade: Trade): void
}

export const AnalyticsContext = createContext({} as IAnalyticsContext)
