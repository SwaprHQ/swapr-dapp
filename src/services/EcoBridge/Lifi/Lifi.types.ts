import { ChainId } from '@swapr/sdk'

import { Order } from '@lifi/sdk'
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

export type LifiTokenMap = {
  [key: string]: LifiTokenInfo
}

const BridgeNames = [
  'connext',
  'hop',
  'cbridge',
  'optimism',
  'arbitrum',
  'avalanche',
  'across',
  'hyphen',
  'omni',
  'gnosis',
  'multichain',
  'stargate',
] as const

const ExchangeNames = [
  'dodo',
  'paraswap',
  '1inch',
  'openocean',
  '0x',
  'uniswap',
  'sushiswap',
  'quickswap',
  'honeyswap',
  'lif3swap',
  'pancakeswap',
  'swapr',
  'spookyswap',
  'spiritswap',
  'soulswap',
  'tombswap',
  'pangolin',
  'solarbeam',
  'jswap',
  'okcswap',
  'cronaswap',
  'stellaswap',
  'beamswap',
  'voltage',
  'ubeswap',
  'trisolaris',
  'wagyuswap',
  'superfluid',
  'stable',
] as const

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

export interface RoutesRequest {
  fromChainId: number
  fromAmount: string
  fromTokenAddress: string
  fromAddress?: string
  toChainId: number
  toTokenAddress: string
  toAddress?: string
  options?: RouteOptions
}

export interface RouteOptions {
  order?: Order // 'RECOMMENDED' | 'FASTEST' | 'CHEAPEST' | 'SAFEST'
  slippage?: number // expressed as decimal proportion: 0.03 represents 3%
  infiniteApproval?: boolean
  allowSwitchChain?: boolean
  integrator?: string // string telling us who you are
  referrer?: string // string telling us who referred you to us
  fee?: number // expressed as decimal proportion: 0.03 represents 3%
  bridges?: AllowDenyPrefer
  exchanges?: AllowDenyPrefer
}

interface AllowDenyPrefer {
  allow?: string[]
  deny?: string[]
  prefer?: string[]
}
