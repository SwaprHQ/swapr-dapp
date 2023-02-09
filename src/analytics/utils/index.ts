import { ChainId, Trade } from '@swapr/sdk'

import { BridgeTransactionSummary } from '../../state/bridgeTransactions/types'

export const ClickEvents = { CHART_OFF: 'click/chartOff', CHART_PRO: 'click/chartPro' }

export function getProModeEventNameByChainId(chainId?: ChainId): string {
  if (!chainId) return 'proMode/not-defined/15seconds'

  return {
    [ChainId.MAINNET]: 'proMode/ethereum/15seconds',
    [ChainId.GOERLI]: 'proMode/goerli/15seconds',
    [ChainId.GNOSIS]: 'proMode/gnosis/15seconds',
    [ChainId.RINKEBY]: 'proMode/rinkbey/15seconds',
    [ChainId.ARBITRUM_ONE]: 'proMode/arbitrum/15seconds',
    [ChainId.OPTIMISM_MAINNET]: 'proMode/optimism/15seconds',
    [ChainId.POLYGON]: 'proMode/polygon/15seconds',
    [ChainId.ARBITRUM_GOERLI]: 'proMode/arbitrum-goerli/15seconds',
    [ChainId.ARBITRUM_RINKEBY]: 'proMode/arbitrum-rinkeby/15seconds',
    [ChainId.BSC_MAINNET]: 'proMode/bsc/15seconds',
    [ChainId.BSC_TESTNET]: 'proMode/bsc-testnet/15seconds',
    [ChainId.OPTIMISM_MAINNET]: 'proMode/optimism/15seconds',
    [ChainId.OPTIMISM_GOERLI]: 'proMode/optimism-goerli/15seconds',
  }[chainId]
}

/**
 * Creates an unique ID for a trade and bridge transaction instance.
 * @param item
 * @returns
 */
export function computeItemId(item: Trade | BridgeTransactionSummary) {
  if (item instanceof Trade) {
    return `${item.platform.name.toLowerCase()}-${item.chainId}/${item.inputAmount.currency.address}-${
      item.outputAmount.currency.address
    }-${item.inputAmount.raw.toString()}-${item.outputAmount.raw.toString()}`
  }

  // the ID is not meant to be readable, it's just a unique identifier
  return `ecoBridge/${item.bridgeId.toLowerCase()}/${item.fromChainId}:${item.toChainId}/${item.fromValue}:${
    item.toValue
  }`
}
