import { SdkBase, SdkPool, SdkRouter, SdkUtils } from '@connext/sdk'
import { EntityState } from '@reduxjs/toolkit'
import { BigNumberish } from 'ethers'

import { BridgeTransactionSummary } from '../../../state/bridgeTransactions/types'

export type ConnextSDK = {
  sdkBase: SdkBase
  sdkUtils: SdkUtils
  sdkRouter: SdkRouter
  sdkPool: SdkPool
}

export type ConnextToken = {
  id: string
  symbol: string
  name: string
  logoURI?: string
  is_staging?: boolean
  contracts: {
    [chainId: string]: {
      contract_address: string
      contract_decimals: number
    }
  }
}

// export type ConnextOldQuote = {
//   bid: {
//     amount: string
//     amountReceived: string
//     bidExpiry: number
//     callDataHash: string
//     callTo: string
//     encryptedCallData: string
//     expiry: number
//     initiator: string
//     receivingAddress: string
//     receivingAssetId: string
//     receivingChainId: number
//     receivingChainTxManagerAddress: string
//     router: string
//     sendingAssetId: string
//     sendingChainId: number
//     sendingChainTxManagerAddress: string
//     transactionId: string
//     user: string
//   }
//   bidSignature?: string
//   gasFeeInReceivingToken: string
//   metaTxRelayerFee: string
//   routerFee: string
//   totalFee: string
// }

export type ConnextQuote = {
  amountReceived: BigNumberish
  originSlippage: BigNumberish
  routerFee: BigNumberish
  destinationSlippage: BigNumberish
  isFastPath: boolean
}

export interface ConnextBridgeState {
  transactions: EntityState<ConnextTransaction>
}
export type ConnextTransactionsSubgraph = {
  transactions: ConnextTransaction[]
}

export type ConnextTransaction = {
  amount: string
  amountReceived: string
  bidSignature?: string
  callData: null | string
  callDataHash: string
  callTo: string
  cancelCaller: null | string
  cancelMeta: null | string
  cancelTimestamp: null | string
  cancelTransactionHash: null | string
  chainId: string
  encodedBid?: string
  encryptedCallData: string
  expiry: string
  externalCallIsContract?: boolean
  externalCallReturnData?: null | string
  externalCallSuccess?: boolean
  fulfillCaller?: null | string
  fulfillMeta?: null | string
  fulfillTimestamp?: null | string
  fulfillTransactionHash: null | string
  id?: string
  initiator: string
  prepareCaller?: string
  prepareMeta?: string
  prepareTransactionHash: string
  preparedBlockNumber: string
  preparedTimestamp: string
  receivingAddress: string
  receivingAssetId: string
  receivingChainId: string
  receivingChainTxManagerAddress: string
  relayerFee?: null | string
  router: { id: string }
  sendingAssetId: string
  sendingChainFallback?: string
  sendingChainId: string
  signature: null | string
  status: ConnextTransactionStatus
  transactionId: string
  user: { id: string }
  fulfillPending?: boolean
}

export type TransactionsSummary = { [transactionId: string]: BridgeTransactionSummary }

export enum ConnextTransactionStatus {
  PREPARED = 'Prepared',
  CANCELLED = 'Cancelled',
  FULFILLED = 'Fulfilled',
  PENDING = 'Pending',
}
