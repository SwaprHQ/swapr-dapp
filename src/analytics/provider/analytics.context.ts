import { Trade } from '@swapr/sdk'

import { createContext } from 'react'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { ChartOptions } from '../../state/user/reducer'
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
  trackEcoRouterTradeVolume(trade: Trade, chartOption: ChartOptions): void
  /**
   * Track the volume of a trade in USD and send it to Fathom
   */
  trackEcoBridgeTradeVolume(transactionSummary: BridgeTransactionSummary): void
}

export const AnalyticsContext = createContext({} as IAnalyticsContext)
