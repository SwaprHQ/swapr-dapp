import { ChainId } from '@swapr/sdk'
import { INFURA_PROJECT_ID } from '../../connectors'
import { NETWORK_DETAIL } from '../../constants'
import { JsonRpcProvider } from '@ethersproject/providers'
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
  [ChainId.ARBITRUM_RINKEBY]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.ARBITRUM_RINKEBY].rpcUrls[0])),
  [ChainId.RINKEBY]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.RINKEBY].rpcUrls[0])),
  [ChainId.XDAI]: new JsonRpcProvider(addInfuraKey(NETWORK_DETAIL[ChainId.XDAI].rpcUrls[0])),
})
