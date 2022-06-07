import { ChainId } from '@swapr/sdk'
import EtherLogo from '../../assets/images/ether-logo.png'
import XDAILogo from '../../assets/images/xdai-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'

export const NATIVE_CURRENCY_LOGO: { [chainId in ChainId]: string } = {
  [ChainId.XDAI]: XDAILogo,
  [ChainId.MAINNET]: EtherLogo,
  [ChainId.RINKEBY]: EtherLogo,
  [ChainId.ARBITRUM_ONE]: EtherLogo,
  [ChainId.ARBITRUM_RINKEBY]: EtherLogo,
  [ChainId.POLYGON]: PolygonMaticLogo,
}

// From repo https://github.com/trustwallet/assets/tree/master/blockchains
const trustWalletChainMapping: { [chainId in ChainId]?: string } = {
  [ChainId.XDAI]: 'xdai',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
}

export const getTokenLogoURL = (address: string, chainId = ChainId.MAINNET) => {
  const chainKey = trustWalletChainMapping[chainId] || 'ethereum'

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainKey}/assets/${address}/logo.png`
}
