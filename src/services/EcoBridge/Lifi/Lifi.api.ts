import LIFI, { ExecutionSettings, RouteOptions, ChainId, QuoteRequest, GetStatusRequest } from '@lifi/sdk'

type ConfigUpdate = {
  apiUrl?: string
  rpcs?: Record<number, string[]>
  multicallAddresses?: Record<number, string | undefined>
  defaultExecutionSettings?: ExecutionSettings
  defaultRouteOptions?: RouteOptions
}

const lifiConfig: ConfigUpdate = {
  defaultRouteOptions: {
    allowSwitchChain: false,
  },
}

const Lifi = new LIFI(lifiConfig)

export const LifiApi = {
  async getTokenList(fromChain: ChainId, toChain: ChainId) {
    const { tokens } = await Lifi.getTokens({ chains: [fromChain, toChain] })
    const fromChainTokens = tokens[fromChain]
    const toChainTokens = tokens[toChain]
    return {
      fromChainTokens,
      toChainTokens,
    }
  },

  async getStatus(statusRequest: GetStatusRequest) {
    return await Lifi.getStatus(statusRequest)
  },
  async getQuote(routeRequest: QuoteRequest) {
    return await Lifi.getQuote(routeRequest)
  },
}
