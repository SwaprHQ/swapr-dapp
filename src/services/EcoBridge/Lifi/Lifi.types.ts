import { ChainId, GetStatusRequest, QuoteRequest, StatusResponse } from '@lifi/sdk'

type LifiTokenInfo = {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name: string
  coinKey: string
  priceUSD: string
  logoURI: string
}
export interface LifiQuoteRequest extends Omit<QuoteRequest, 'fromAddress'> {
  requestId: number
}

export interface LifiTransactionStatus {
  statusRequest: GetStatusRequest
  statusResponse: StatusResponse
  account: string
  timeResolved?: number
}

export interface LifiStatusResponse extends StatusResponse {
  timeResolved?: number
}

export type LifiTokenMap = {
  [key: string]: LifiTokenInfo
}

export type GetTokenList = {
  fromChain: ChainId
  toChain: ChainId
}
