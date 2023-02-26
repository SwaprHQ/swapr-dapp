import { GetStatusRequest, QuoteRequest, StatusResponse } from '@lifi/sdk'

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

export enum LifiTxStatus {
  PENDING = 'PENDING',
  INVALID = 'INVALID',
  ERROR = 'ERROR',
  FAILED = 'FAILED',
  DONE = 'DONE',
}

export const LIFI_PENDING_REASONS = {
  WAIT_SOURCE_CONFIRMATIONS: 'The bridge is waiting for additional confirmations.',
  WAIT_DESTINATION_TRANSACTION: 'Transaction on destination chain has not been confirmed yet.',
  BRIDGE_NOT_AVAILABLE: 'The bridge API / subgraph is temporarily unavailable, check back later.',
  CHAIN_NOT_AVAILABLE: 'The RPC for the source/destination chain is temporarily unavailable',
  NOT_PROCESSABLE_REFUND_NEEDED: 'The transfer cannot be completed, a refund is required.',
  REFUND_IN_PROGRESS:
    'The refund has been requested and its being processed (not all bridges will go through this state!)',
  UNKNOWN_ERROR: 'We cannot determine the status of the transfer.',
  COMPLETED: 'The transfer was successful.',
  PARTIAL:
    'The transfer was partially successful. This can happen for specific bridges like across , multichain or connext which may provide alternative tokens in case of low liquidity.',
  REFUNDED: ' The transfer was not successful and the sent token has been refunded',
}

export type LifiTokenMap = {
  [key: string]: LifiTokenInfo
}

// const BridgeNames = [
//   'connext',
//   'hop',
//   'cbridge',
//   'optimism',
//   'arbitrum',
//   'avalanche',
//   'across',
//   'hyphen',
//   'omni',
//   'gnosis',
//   'multichain',
//   'stargate',
// ] as const

// const ExchangeNames = [
//   'dodo',
//   'paraswap',
//   '1inch',
//   'openocean',
//   '0x',
//   'uniswap',
//   'sushiswap',
//   'quickswap',
//   'honeyswap',
//   'lif3swap',
//   'pancakeswap',
//   'swapr',
//   'spookyswap',
//   'spiritswap',
//   'soulswap',
//   'tombswap',
//   'pangolin',
//   'solarbeam',
//   'jswap',
//   'okcswap',
//   'cronaswap',
//   'stellaswap',
//   'beamswap',
//   'voltage',
//   'ubeswap',
//   'trisolaris',
//   'wagyuswap',
//   'superfluid',
//   'stable',
// ] as const

// type AllowedBridges = {
//   allow: typeof BridgeNames
// }

// type Exchanges = {
//   allow: typeof ExchangeNames
// }

// const Tags = ['RECOMMENDED', 'CHEAPEST', 'FASTEST', 'SAFEST'] as const

// type RouteOption = {
//   bridges: AllowedBridges
//   exchanges: Exchanges
//   integrator: 'swapr.eth.limo'
//   order: (typeof Tags)[number]
//   slippage: number
//   referrer?: string
// }

// export interface RouteRequest {
//   fromAddress: string
//   fromAmount: string
//   fromChainId: ChainId
//   toAddress: string
//   toChainId: ChainId
//   toTokenAddress: string
//   options: RouteOption
// }

// type Token = {
//   address: string
//   chainId: ChainId
//   coinKey: string // "XDAI"
//   decimals: number
//   logoURI: string // "https://static.debank.com/image/matic_token/logo_url/0x8f3cf7ad23cd3cadbd9735aff958023239c6a063/549c4205dbb199f1b8b03af783f35e71.png"
//   name: string //   "(PoS) Dai Stablecoin"
//   priceUSD: string //"0.9986"
//   symbol: string // "DAI"
// }

// type ToolDetail = {
//   name: string
//   logoURI: string
//   key: string
// }

// type Action = {
//   fromAddress: string
//   fromAmount: string
//   fromChainId: ChainId
//   fromToken: Token
//   slippage: number
//   toAddress: string
//   toChainId: ChainId
//   toToken: Token
// }

// type Estimate = {
//   approvalAddress: string
//   executionDuration: number
//   fromAmount: string
//   fromAmountUSD: string
//   toAmount: string
//   toAmountMin: string
//   toAmountUSD: string
//   gasCosts: any
//   feeCosts: any
//   data: any
// }

// type Step = {
//   action: Action
//   estimate: Estimate
//   includedSteps: any
//   id: string
//   integrator: string //swapr.eth.limo
//   referrer?: string
//   tool: string
//   toolDetails: ToolDetail
//   type: string //'lifi'
// }

// export interface Route {
//   id: string
//   gasCostUSD: string
//   containsSwitchChain: Boolean
//   fromAddress: string
//   fromAmount: string
//   fromAmountUSD: string
//   fromChainId: ChainId
//   toAddress: string
//   toAmount: string
//   toAmountMin: string
//   toAmountUSD: string
//   toChainId: ChainId
//   fromToken: Token
//   toToken: Token
//   tags: typeof Tags | []
//   steps: Step[]
// }

// export interface RoutesRequest {
//   fromChainId: number
//   fromAmount: string
//   fromTokenAddress: string
//   fromAddress?: string
//   toChainId: number
//   toTokenAddress: string
//   toAddress?: string
//   options?: RouteOptions
// }

// export interface RouteOptions {
//   order?: Order // 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST'
//   slippage?: number // expressed as decimal proportion: 0.03 represents 3%
//   infiniteApproval?: boolean
//   allowSwitchChain?: boolean
//   integrator?: string // string telling us who you are
//   referrer?: string // string telling us who referred you to us
//   fee?: number // expressed as decimal proportion: 0.03 represents 3%
//   bridges?: AllowDenyPrefer
//   exchanges?: AllowDenyPrefer
// }

// interface AllowDenyPrefer {
//   allow?: string[]
//   deny?: string[]
//   prefer?: string[]
// }
