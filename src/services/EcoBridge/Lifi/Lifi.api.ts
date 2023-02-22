import { ChainId } from '@swapr/sdk'

import LIFI, { TokensResponse } from '@lifi/sdk'

import { RoutesRequest } from './Lifi.types'
import { LifiChainShortNames } from './Lifi.utils'
const Lifi = new LIFI()

export const LifiApi = {
  async getTokenList(fromChain: ChainId, toChain: ChainId) {
    const url = new URL('https://li.quest/v1/tokens')
    const fromToChains = `${LifiChainShortNames.get(fromChain)},${LifiChainShortNames.get(toChain)}`
    url.searchParams.append('chains', fromToChains)
    const options = { method: 'GET', headers: { accept: 'application/json' } }

    const response = await fetch(url, options)
    const { tokens }: TokensResponse = await response.json()
    const fromChainTokens = tokens[fromChain]
    const toChainTokens = tokens[toChain]
    return {
      fromChainTokens,
      toChainTokens,
    }
  },
  async getRoutes(routeRequest: RoutesRequest) {
    const result = await Lifi.getRoutes(routeRequest)
    return result.routes
  },
}
