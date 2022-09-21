import { Trade } from '@swapr/sdk'

/**
 * Creates an unique ID for a trade instance
 * @param trade
 * @returns
 */
export function computeTradeId(trade: Trade) {
  return `${trade.platform.name.toLowerCase()}-${trade.chainId}/${trade.inputAmount.currency.address}-${
    trade.outputAmount.currency.address
  }-${trade.inputAmount.raw.toString()}-${trade.outputAmount.raw.toString()}`
}
