import { AddressZero } from '@ethersproject/constants'
import { Trade } from '@swapr/sdk'

import debugFactory from 'debug'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'
import { getTradeUSDValue, getUSDPriceCurrencyQuote, getUSDPriceTokenQuote } from '../../utils/coingecko'
import {
  FathomSiteInformation,
  getEcoBridgeVolumeUSDEventName,
  getEcoRouterVolumeUSDEventName,
  getNetworkNameByChainId,
} from '../generated/prod'

const debug = debugFactory('analytics:trackers')

/**
 * Processes the trade volume event
 * @param trade Trade
 * @returns void
 * @throws Error on null USD value and when
 */
export async function trackEcoRouterTradeVolume(trade: Trade, site: FathomSiteInformation) {
  debug('tracking EcoRouter trade USD volume', { trade, site })
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
    throw new Error(`Event ID for (${eventName}) not found in site (${site.siteId})`)
  }

  window.fathom.trackGoal(eventId, tradeUSDValueInCents)
}

/**
 * Processes the trade volume event
 * @param trade Trade
 * @returns void
 * @throws Error on null USD value and when
 */
export async function trackEcoBridgeTradeVolume(trade: BridgeTransactionSummary, site: FathomSiteInformation) {
  debug('tracking EcoBridge trade USD volume', { trade, site })

  const isNativeToken = (trade.assetAddressL1 === AddressZero || trade.assetAddressL1 === 'XDAI') && trade.fromChainId

  let rawTokenPriceInfo = isNativeToken
    ? await getUSDPriceCurrencyQuote({
        chainId: trade.fromChainId,
      })
    : await getUSDPriceTokenQuote({
        tokenAddress: trade.assetAddressL1,
        chainId: trade.fromChainId,
      })

  if (rawTokenPriceInfo === null) {
    throw new Error('Could not get token price')
  }

  const tokenUSDPrice = Object.values(rawTokenPriceInfo)[0].usd
  const usdValue = (tokenUSDPrice * parseFloat(trade.fromValue)).toFixed(2)
  const tradeUSDValueInCents = (parseFloat(parseFloat(usdValue).toFixed(2)) * 100).toString() // convert to cents because fathom requires it
  const eventName = getEcoBridgeVolumeUSDEventName(trade.bridgeId, trade.fromChainId, trade.toChainId)
  const eventId = site.events.find(event => event.name === eventName)?.id

  if (!eventId) {
    throw new Error(`Event ID for (${eventName}) not found in site (${site.siteId})`)
  }

  window.fathom.trackGoal(eventId, tradeUSDValueInCents)
}
