import { ChainId } from '@swapr/sdk'
import { BridgeTransactionStatus, BridgeTxnType } from '../state/bridgeTransactions/types'
import { getNetworkInfo } from './networksList'

export type ChainIdPair = {
  l1ChainId: ChainId | undefined
  l2ChainId: ChainId | undefined
  chainId: ChainId | undefined
  partnerChainId: ChainId | undefined
  isArbitrum: boolean | undefined
}

export const getChainPair = (chainId?: ChainId): ChainIdPair => {
  if (!chainId) {
    return {
      l1ChainId: chainId,
      l2ChainId: undefined,
      chainId,
      partnerChainId: undefined,
      isArbitrum: undefined,
    }
  }

  const { isArbitrum, chainId: networkChainId, partnerChainId } = getNetworkInfo(chainId)
  const l1 = !isArbitrum ? networkChainId : partnerChainId
  const l2 = isArbitrum ? networkChainId : partnerChainId

  if (l1 && l2) {
    return {
      l1ChainId: Number(l1) as ChainId,
      l2ChainId: Number(l2) as ChainId,
      chainId,
      partnerChainId,
      isArbitrum,
    }
  }

  return {
    l1ChainId: chainId,
    l2ChainId: undefined,
    chainId,
    partnerChainId: undefined,
    isArbitrum: false,
  }
}

export const getBridgeTxStatus = (txStatus: number | undefined): BridgeTransactionStatus => {
  switch (txStatus) {
    case 0:
      return BridgeTransactionStatus.FAILED
    case 1:
      return BridgeTransactionStatus.CONFIRMED
    default:
      return BridgeTransactionStatus.PENDING
  }
}

export const txnTypeToOrigin = (txnType: BridgeTxnType): 1 | 2 => {
  switch (txnType) {
    case 'deposit':
    case 'deposit-l1':
    case 'deposit-l2':
    case 'outbox':
    case 'approve':
    case 'connext-deposit':
      return 1
    case 'withdraw':
    case 'connext-withdraw':
    case 'deposit-l2-auto-redeem':
      return 2
  }
}

export const txnTypeToLayer = (txnType: BridgeTxnType): 1 | 2 => {
  switch (txnType) {
    case 'deposit':
    case 'deposit-l1':
    case 'outbox':
    case 'approve':
    case 'connext-deposit':
      return 1
    case 'deposit-l2':
    case 'withdraw':
    case 'connext-withdraw':
    case 'deposit-l2-auto-redeem':
      return 2
  }
}
