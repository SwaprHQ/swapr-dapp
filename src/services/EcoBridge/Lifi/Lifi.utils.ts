import { ChainId as SwaprChainId } from '@swapr/sdk'

import { ChainId, StatusResponse } from '@lifi/sdk'

import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { LIFI_TXN_STATUS } from './Lifi.constants'

// // Add more chains keys on the go from
// //'https://li.quest/v1/chains';

export const LifiChainShortNames = new Map([
  [SwaprChainId.MAINNET, 'ETH'],
  [SwaprChainId.POLYGON, 'POL'],
  [SwaprChainId.GNOSIS, 'DAI'],
  [SwaprChainId.OPTIMISM_MAINNET, 'OPT'],
  [SwaprChainId.ARBITRUM_ONE, 'ARB'],
  [SwaprChainId.BSC_MAINNET, 'BSC'],
])

export function isLifiChainId(value: any): value is ChainId {
  return Object.values(ChainId).indexOf(value) > -1
}

export function getStatus(status: StatusResponse['status']) {
  switch (status) {
    case LIFI_TXN_STATUS.DONE:
      return BridgeTransactionStatus.CONFIRMED
    case LIFI_TXN_STATUS.FAILED:
    case LIFI_TXN_STATUS.INVALID:
      return BridgeTransactionStatus.FAILED
    default:
      return BridgeTransactionStatus.PENDING
  }
}
