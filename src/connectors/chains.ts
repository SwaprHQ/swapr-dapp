import { NETWORK_DETAIL } from './../constants'

export const URLS: { [chainId: number]: string[] } = Object.keys(NETWORK_DETAIL).reduce<{
  [chainId: number]: string[]
}>((accumulator, chainId) => {
  const validURLs: string[] = NETWORK_DETAIL[Number(chainId)].rpcUrls

  if (validURLs.length) {
    accumulator[Number(chainId)] = validURLs
  }

  return accumulator
}, {})
