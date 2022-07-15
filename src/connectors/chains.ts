import type { AddEthereumChainParameter } from '@web3-react/types'

import { NETWORK_DETAIL } from './../constants'

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = NETWORK_DETAIL[chainId]
  if (chainInformation) {
    return {
      chainId,
      chainName: chainInformation.chainName,
      nativeCurrency: {
        name: chainInformation.nativeCurrency.name,
        symbol: chainInformation.nativeCurrency.symbol,
        decimals: 18,
      },
      rpcUrls: chainInformation.rpcUrls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    }
  } else {
    return chainId
  }
}

export const URLS: { [chainId: number]: string[] } = Object.keys(NETWORK_DETAIL).reduce<{
  [chainId: number]: string[]
}>((accumulator, chainId) => {
  const validURLs: string[] = NETWORK_DETAIL[Number(chainId)].rpcUrls

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs
  }

  return accumulator
}, {})
