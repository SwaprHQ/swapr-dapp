import { Trade } from '@swapr/sdk'

import { useCallback, useEffect, useReducer, useState } from 'react'

import { getTradeUSDValue } from '../../utils/coingecko'
import { loadFathom } from '../fathom'
import {
  FathomSiteInformation,
  getEcoRouterVolumeUSDEventName,
  getNetworkNameByChainId,
  siteEvents,
} from '../generated'
import { computeTradeId } from '../utils'
import { AnalyticsContext, IAnalyticsContext } from './analytics.context'
import { ActionType, ItemStatus, reducer } from './analytics.state'

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
   * Processes the trade volume event
   * @param trade Trade
   * @returns void
   * @throws Error on null USD value and when
   */
  const processTrackEcoEcoRouterTradeVolume = useCallback(
    async (trade: Trade) => {
      // Get use value for input amount
      const tradeUSDValue = await getTradeUSDValue(trade)

      if (tradeUSDValue === null) {
        throw new Error('Could not get trade USD value', {
          cause: 'USD_VALUE_NULL',
        })
      }

      const tradeUSDValueInCents = (parseFloat(parseFloat(tradeUSDValue).toFixed(2)) * 100).toString() // convert to cents because fathom requires it
      const networkName = getNetworkNameByChainId(trade.chainId as number)
      const eventName = getEcoRouterVolumeUSDEventName(networkName, trade.chainId, trade.platform.name)
      const eventId = site?.events.find(event => event.name === eventName)?.id

      if (!eventId) {
        throw new Error(`Event ID for (${eventName}) not found`)
      }

      window.fathom.trackGoal(eventId, tradeUSDValueInCents)
    },
    [site]
  )

  /**
   * Processes the trade queue
   */
  const processQueue = useCallback(async () => {
    const pendingItems = Object.values(tradeQueue).filter(item => item.status === ItemStatus.PENDING)

    for await (const pendingItem of pendingItems) {
      processTrackEcoEcoRouterTradeVolume(pendingItem.trade)
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
  }, [tradeQueue, processTrackEcoEcoRouterTradeVolume])

  useEffect(() => {
    let processQueueTimeout: NodeJS.Timeout

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

    const startQueueProcessing = () => {
      processQueueTimeout = setTimeout(() => {
        processQueue().finally(startQueueProcessing)
      }, 30000)
    }

    loadFathom(siteId)
      .then(() => {
        console.info('loadFathom: Fathom loaded. Setting siteEvents', { siteEvents })
        setSite(siteEvents)
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

  const context = {
    site,
    fathom: window.fathom,
    async trackEcoEcoRouterTradeVolume(trade) {
      if (!site || !window.fathom) {
        console.error('trackEcoEcoRouterTradeVolume: Fathom site not found', { site, fathom: window.fathom })
        return
      }

      // Attempt to process the trade volume event
      // If it fails, add it to the queue
      processTrackEcoEcoRouterTradeVolume(trade).catch(error => {
        console.error('trackEcoEcoRouterTradeVolume: Error processing trade', { trade, error })
        const id = computeTradeId(trade)
        tradeQueueDispatch({
          type: ActionType.ADD,
          payload: { id, trade, status: ItemStatus.PENDING, retries: 0 },
        })
      })
    },
  } as IAnalyticsContext

  return <AnalyticsContext.Provider value={context as any}>{children}</AnalyticsContext.Provider>
}
