import { Trade } from '@swapr/sdk'

import debugFactory from 'debug'
import { useEffect, useRef, useState } from 'react'

import { useEnvironment } from '../../hooks/useEnvironment'
import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { loadFathom } from '../fathom'
import { siteEvents as siteEventsDev } from '../generated/dev'
import { FathomSiteInformation, siteEvents as siteEventsProd } from '../generated/prod'
import * as trackers from '../trackers'
import { computeItemId } from '../utils'
import { AnalyticsContext, IAnalyticsContext } from './analytics.context'
import { AnalyticsTradeQueueState, ItemStatus } from './analytics.state'

const debug = debugFactory('analytics')

export interface AnalyticsProviderProps {
  children: React.ReactNode
}

/**
 * AnalyticsProvider: provides the analytics context to the application
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const [site, setSite] = useState<FathomSiteInformation>()
  const [tradeQueue, setTradeQueue] = useState<AnalyticsTradeQueueState>({})
  const { isProduction, isDevelopment } = useEnvironment()
  // Load the fathom site information
  useEffect(() => {
    const siteId = process.env.REACT_APP_FATHOM_SITE_ID
    const siteScriptURL = process.env.REACT_APP_FATHOM_SITE_SCRIPT_URL
    const siteEvents = siteEventsProd.siteId === siteId ? siteEventsProd : siteEventsDev

    debug('Loading Fathom', { siteId, siteScriptURL, siteEvents })

    if (!siteId && isDevelopment) {
      console.warn('REACT_APP_FATHOM_SITE_ID not set, skipping Fathom analytics')
      return
    }

    if (siteId !== siteEvents.siteId) {
      console.error(`Fathom site ID (${siteId}) not found in generated fathom settings. Found (${siteEvents.siteId})`)
      return
    }

    loadFathom(siteId, siteScriptURL)
      .then(() => {
        debug('loadFathom: Fathom loaded. Setting siteEvents', { siteEvents })
        setSite(siteEvents as FathomSiteInformation)
      })
      .catch(error => {
        console.error('Error loading Fathom analytics', error)
      })

    // clean up
    return () => {
      setSite(undefined)
      setTradeQueue({})
    }
  }, [isDevelopment, isProduction])

  // Queue processing
  useEffect(() => {
    if (!site) {
      return
    }

    debug('useEffect: tradeQueue', { tradeQueue, 'timeoutRef.current': timeoutRef.current })

    // clear the timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    /**
     * Processes the trade queue
     */
    const processQueue = async () => {
      debug('Processing queue', { site, tradeQueue })
      const pendingItems = Object.values(tradeQueue).filter(item => item.status === ItemStatus.PENDING)

      for await (const pendingItem of pendingItems) {
        debug('Processing item', { pendingItem })
        try {
          if (pendingItem.item instanceof Trade) {
            await trackers.trackEcoRouterTradeVolume(pendingItem.item, site as FathomSiteInformation)
          } else {
            await trackers.trackEcoBridgeTradeVolume(pendingItem.item, site as FathomSiteInformation)
          }

          const payload = {
            ...pendingItem,
            status: ItemStatus.COMPLETE,
          }

          debug('Item processed', { pendingItem, payload })
          setTradeQueue(state => ({ ...state, [pendingItem.id]: payload }))
        } catch (error) {
          const retries = pendingItem.retries + 1
          const status = retries >= 5 ? ItemStatus.FAILED : ItemStatus.PENDING
          const payload = {
            ...pendingItem,
            retries,
            status,
          }
          debug('Error processing', { pendingItem, error, nextPayload: payload })
          setTradeQueue(state => ({ ...state, [pendingItem.id]: payload }))
        }
      }

      debug('Queue processed', { tradeQueue })
    }

    const startQueueProcessing = () => {
      timeoutRef.current = setTimeout(() => {
        processQueue().finally(startQueueProcessing)
      }, 40000)
    }

    startQueueProcessing()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [site, tradeQueue])

  const trackEcoRouterTradeVolume = (trade: Trade) => {
    if (!site || !window.fathom) {
      return console.error('Fathom site not found', { site, fathom: window.fathom })
    }

    // Attempt to process the trade volume event
    // If it fails, add it to the queue
    trackers
      .trackEcoRouterTradeVolume(trade, site)
      .then(() => debug('processed trade volume event', { trade }))
      .catch(error => {
        console.error('Error processing trade', { trade, error })
        const id = computeItemId(trade)
        setTradeQueue(state => ({
          ...state,
          [id]: {
            id,
            item: trade,
            status: ItemStatus.PENDING,
            retries: 0,
          },
        }))
      })
  }

  const trackEcoBridgeTradeVolume = (transactionSummary: BridgeTransactionSummary) => {
    if (!site || !window.fathom) {
      return console.error('Fathom site not found', { site, fathom: window.fathom })
    }

    trackers
      .trackEcoBridgeTradeVolume(transactionSummary, site)
      .then(() => debug('processed trade volume event', { transactionSummary }))
      .catch(error => {
        console.error('Error processing trade', { transactionSummary, error })
        const id = computeItemId(transactionSummary)
        setTradeQueue(state => ({
          ...state,
          [id]: {
            id,
            item: transactionSummary,
            status: ItemStatus.PENDING,
            retries: 0,
          },
        }))
      })
  }

  return (
    <AnalyticsContext.Provider
      value={
        {
          site,
          fathom: window.fathom,
          trackEcoRouterTradeVolume,
          trackEcoBridgeTradeVolume,
        } as IAnalyticsContext
      }
    >
      {children}
    </AnalyticsContext.Provider>
  )
}
