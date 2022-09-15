import { useEffect, useState } from 'react'

import { getTradeUSDValue } from '../../utils/coingecko'
import { loadFathom } from '../fathom'
import {
  FathomSiteInformation,
  getEcoRouterVolumeUSDEventName,
  getNetworkNameByChainId,
  siteEvents,
} from '../generated'
import { AnalyticsContext, IAnalyticsContext } from './analytics.context'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

/**
 * AnalyticsProvider: provides the analytics context to the application
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [site, setSite] = useState<FathomSiteInformation>()

  useEffect(() => {
    const siteId = process.env.REACT_APP_FATHOM_SITE_ID

    if (!siteId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('REACT_APP_FATHOM_SITE_ID not set, skipping Fathom analytics')
      }
      return
    }

    if (siteId !== siteEvents.siteId) {
      console.error(`Fathom site ID (${siteId}) not found in generated fathom settings`)
      return
    }

    loadFathom(siteId)
      .then(() => {
        console.log('loadFathom: Fathom loaded. Setting siteEvents', { siteEvents })
        setSite(siteEvents)
      })
      .catch(error => {
        console.error('Error loading Fathom analytics', error)
      })
  }, [])

  const context = {
    site,
    fathom: window.fathom,
    async trackEcoEcoRouterTradeVolume(trade) {
      // Get use value for input amount
      const tradeUSDValue = await getTradeUSDValue(trade)

      if (!tradeUSDValue || !site || !window.fathom) {
        console.error('trackEcoEcoRouterTradeVolume: tradeUSDValue not found', { trade })
        return
      }

      const tradeUSDValueInCents = (parseFloat(parseFloat(tradeUSDValue).toFixed(2)) * 100).toString() // convert to cents because fathom requires it

      const volumeUSD = tradeUSDValueInCents
      const networkName = getNetworkNameByChainId(trade.chainId as number)
      const eventName = getEcoRouterVolumeUSDEventName(networkName, trade.chainId, trade.platform.name)

      const eventId = site?.events.find(event => event.name === eventName)?.id

      if (!eventId) {
        console.error('trackEcoRouterVolumeUSD: event not found', { eventName })
        return
      }

      window.fathom.trackGoal(eventId, volumeUSD as any)
    },
  } as IAnalyticsContext

  return <AnalyticsContext.Provider value={context as any}>{children}</AnalyticsContext.Provider>
}
