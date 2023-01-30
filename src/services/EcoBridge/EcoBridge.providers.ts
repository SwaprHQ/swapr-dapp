import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { INFURA_PROJECT_ID } from '../../connectors'
import { NETWORK_DETAIL } from '../../constants'
import { EcoBridgeProviders } from './EcoBridge.types'

const addInfuraKey = (rpcUrl: string) => {
  if (rpcUrl.includes('infura')) {
    return rpcUrl.endsWith('/') ? `${rpcUrl}${INFURA_PROJECT_ID}` : `${rpcUrl}/${INFURA_PROJECT_ID}`
  }

  return rpcUrl
}

export const initiateEcoBridgeProviders = (): EcoBridgeProviders => ({
  [ChainId.MAINNET]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.MAINNET].rpcUrls[0])),
  [ChainId.ARBITRUM_ONE]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.ARBITRUM_ONE].rpcUrls[0])),
  [ChainId.ARBITRUM_GOERLI]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.ARBITRUM_GOERLI].rpcUrls[0])),
  [ChainId.GOERLI]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.GOERLI].rpcUrls[0])),
  [ChainId.XDAI]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.XDAI].rpcUrls[0])),
})
