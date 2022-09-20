import { Trade } from '@swapr/sdk'

import debugFactory from 'debug'
import { useCallback, useEffect, useReducer, useState } from 'react'

import { loadFathom } from '../fathom'
import { siteEvents as siteEventsDev } from '../generated/dev'
import { FathomSiteInformation, siteEvents as siteEventsProd } from '../generated/prod'
import * as trackers from '../trackers'
import { computeTradeId } from '../utils'
import { AnalyticsContext, IAnalyticsContext } from './analytics.context'
import { ActionType, ItemStatus, reducer } from './analytics.state'

const debug = debugFactory('analytics')

export interface AnalyticsProviderProps {
  children: React.ReactNode
}

/**
 * AnalyticsProvider: provides the analytics context to the application
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [site, setSite] = useState<FathomSiteInformation>()
  const [tradeQueue, tradeQueueDispatch] = useReducer(reducer, {})

  /**
   * Processes the trade queue
   */
  const processQueue = useCallback(async () => {
    const pendingItems = Object.values(tradeQueue).filter(item => item.status === ItemStatus.PENDING)

    for await (const pendingItem of pendingItems) {
      trackers
        .trackEcoEcoRouterTradeVolume(pendingItem.trade, site as FathomSiteInformation)
        .then(() => {
          tradeQueueDispatch({
            type: ActionType.UPDATE,
            payload: {
              ...pendingItem,
              status: ItemStatus.COMPLETE,
            },
          })
        })
        .catch(() => {
          const retries = pendingItem.retries + 1
          const status = retries >= 3 ? ItemStatus.FAILED : ItemStatus.PENDING

          tradeQueueDispatch({
            type: ActionType.UPDATE,
            payload: {
              ...pendingItem,
              status,
              retries,
            },
          })
        })
    }
  }, [tradeQueue, site])

  useEffect(() => {
    let processQueueTimeout: NodeJS.Timeout

    const siteId = process.env.REACT_APP_FATHOM_SITE_ID
    const siteScriptURL = process.env.REACT_APP_FATHOM_SITE_SCRIPT_URL
    const siteEvents = process.env.NODE_ENV === 'production' ? siteEventsProd : siteEventsDev

    debug('Loading Fathom', { siteId, siteScriptURL })

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

    const startQueueProcessing = () => {
      processQueueTimeout = setTimeout(() => {
        processQueue().finally(startQueueProcessing)
      }, 30000)
    }

    loadFathom(siteId, siteScriptURL)
      .then(() => {
        debug('loadFathom: Fathom loaded. Setting siteEvents', { siteEvents })
        setSite(siteEvents as FathomSiteInformation)
        startQueueProcessing() // Start the queue processing
      })
      .catch(error => {
        console.error('Error loading Fathom analytics', error)
      })

    // clean up
    return () => {
      setSite(undefined)
      tradeQueueDispatch({ type: ActionType.CLEAR })
      clearTimeout(processQueueTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const trackEcoEcoRouterTradeVolume = (trade: Trade) => {
    if (!site || !window.fathom) {
      console.error('trackEcoEcoRouterTradeVolume: Fathom site not found', { site, fathom: window.fathom })
      return
    }

    // Attempt to process the trade volume event
    // If it fails, add it to the queue
    trackers
      .trackEcoEcoRouterTradeVolume(trade, site)
      .then(() => {
        debug('trackEcoEcoRouterTradeVolume: processed trade volume event', { trade })
      })
      .catch(error => {
        console.error('trackEcoEcoRouterTradeVolume: Error processing trade', { trade, error })
        const id = computeTradeId(trade)
        tradeQueueDispatch({
          type: ActionType.ADD,
          payload: { id, trade, status: ItemStatus.PENDING, retries: 0 },
        })
      })
  }

  return (
    <AnalyticsContext.Provider
      value={
        {
          site,
          fathom: window.fathom,
          trackEcoEcoRouterTradeVolume,
        } as IAnalyticsContext
      }
    >
      {children}
    </AnalyticsContext.Provider>
  )
}
