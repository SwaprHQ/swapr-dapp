import { BaseRoutablePlatform, RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

import { getChainNameByChainId } from './chain'

interface PlatformInformation {
  platformName: string
  networkName: string
  networkId: string
}

export function getMapOfExchanges(arg: any): PlatformInformation[] {
  const isPrototypeOf = Function.call.bind(Object.prototype.isPrototypeOf)

  if (!(isPrototypeOf(BaseRoutablePlatform, arg) || arg === BaseRoutablePlatform)) return []
  const listOfProperties = Object.getOwnPropertyDescriptors(arg)
  const ofMap = Object.values(listOfProperties)
    .filter(
      el =>
        (el['value'] instanceof RoutablePlatform || el['value'] instanceof UniswapV2RoutablePlatform) &&
        el['enumerable']
    )
    .map(el => {
      const platformName = el.value.name.replace(/ .*/, '').toLowerCase()
      return el.value.chainIds.map(chainId => ({
        platformName,
        networkName: getChainNameByChainId(chainId),
        networkId: chainId,
      }))
    })
    .flat()

  return ofMap
}
