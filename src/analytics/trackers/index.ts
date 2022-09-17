import { Trade } from '@swapr/sdk'

import debugFactory from 'debug'

import { getTradeUSDValue } from '../../utils/coingecko'
import { FathomSiteInformation, getEcoRouterVolumeUSDEventName, getNetworkNameByChainId } from '../generated'

const debug = debugFactory('analytics:trackers')

/**
 * Processes the trade volume event
 * @param trade Trade
 * @returns void
 * @throws Error on null USD value and when
 */
export async function trackEcoEcoRouterTradeVolume(trade: Trade, site: FathomSiteInformation) {
  debug('tracking trade USD volume', { trade, site })
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
  const eventId = site.events.find(event => event.name === eventName)?.id

  if (!eventId) {
    throw new Error(`Event ID for (${eventName}) not found`)
  }

  window.fathom.trackGoal(eventId, tradeUSDValueInCents)
}
