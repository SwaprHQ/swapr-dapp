import { ChainId as SwaprChainId } from '@swapr/sdk'

import { Action, ChainId, StatusResponse, FeeCost } from '@lifi/sdk'

import { BridgeTransactionStatus } from '../../../state/bridgeTransactions/types'
import { formatGasOrFees } from '../../../utils/formatNumber'

import { LIFI_TXN_STATUS } from './Lifi.constants'

export const validateSendingToken = (action: Action, statusResponse: StatusResponse) => {
  const _statusResponse = structuredClone(statusResponse)
  if (
    _statusResponse.sending.token?.address &&
    action &&
    _statusResponse.sending.token?.address !== action.fromToken.address
  ) {
    _statusResponse.sending.token = action.fromToken
    _statusResponse.sending.amount = action.fromAmount
    if (_statusResponse.receiving === undefined) {
      // @ts-expect-error To show receiving Chain till Lifi status is resolved
      _statusResponse.receiving = {
        chainId: action.toChainId,
        token: action.toToken,
      }
    }
  }
  return _statusResponse
}

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

export const getFeeCost = (feeCosts?: FeeCost[], fromAmountUSD?: string) => {
  const totalFeesUsd =
    feeCosts?.reduce((cost, costs) => {
      cost += Number(costs?.amountUSD ?? 0)
      return cost
    }, 0) ?? 0

  const totalFeesPercentage =
    feeCosts?.reduce((cost, costs) => {
      cost += Number(costs?.percentage ?? 0)
      return cost
    }, 0) ?? 0

  const feeAmountUsdFromPercentage = totalFeesPercentage * Number(fromAmountUSD ?? 0)

  return totalFeesUsd !== 0 ? formatGasOrFees(totalFeesUsd) : formatGasOrFees(feeAmountUsdFromPercentage)
}
