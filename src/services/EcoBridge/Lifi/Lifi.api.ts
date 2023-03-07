import LIFI, { ExecutionSettings, RouteOptions, QuoteRequest, GetStatusRequest, RequestOptions } from '@lifi/sdk'

import { GetTokenList } from './Lifi.types'

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
  async getTokenList({ fromChain, toChain }: GetTokenList, requestOptions: RequestOptions) {
    const { tokens } = await Lifi.getTokens({ chains: [fromChain, toChain] }, requestOptions)
    const fromChainTokens = tokens[fromChain]
    const toChainTokens = tokens[toChain]
    return {
      fromChainTokens,
      toChainTokens,
    }
  },

  async getStatus(statusRequest: GetStatusRequest, requestOptions: RequestOptions) {
    return await Lifi.getStatus(statusRequest, requestOptions)
  },
  async getQuote(routeRequest: QuoteRequest, requestOptions: RequestOptions) {
    return await Lifi.getQuote(routeRequest, requestOptions)
  },
}
