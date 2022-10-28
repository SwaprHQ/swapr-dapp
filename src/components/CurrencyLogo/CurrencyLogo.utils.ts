import { ChainId } from '@swapr/sdk'

import BNBLogo from '../../assets/images/bnb-logo.png'
import EtherLogo from '../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../assets/images/xdai-logo.png'

export const NATIVE_CURRENCY_LOGO: { [chainId in ChainId]: string } = {
  [ChainId.XDAI]: XDAILogo,
  [ChainId.MAINNET]: EtherLogo,
  [ChainId.RINKEBY]: EtherLogo,
  [ChainId.ARBITRUM_ONE]: EtherLogo,
  [ChainId.ARBITRUM_RINKEBY]: EtherLogo,
  [ChainId.ARBITRUM_GOERLI]: EtherLogo,
  [ChainId.POLYGON]: PolygonMaticLogo,
  [ChainId.OPTIMISM_GOERLI]: EtherLogo,
  [ChainId.OPTIMISM_MAINNET]: EtherLogo,
  [ChainId.GOERLI]: EtherLogo,
  [ChainId.BSC_MAINNET]: BNBLogo,
  [ChainId.BSC_TESTNET]: BNBLogo,
}

// From repo https://github.com/trustwallet/assets/tree/master/blockchains
const trustWalletChainMapping: { [chainId in ChainId]?: string } = {
  [ChainId.XDAI]: 'xdai',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.OPTIMISM_MAINNET]: 'optimism',
  [ChainId.BSC_MAINNET]: 'binance',
}

export const getTokenLogoURL = (address: string, chainId = ChainId.MAINNET) => {
  const chainKey = trustWalletChainMapping[chainId] || 'ethereum'

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainKey}/assets/${address}/logo.png`
}
