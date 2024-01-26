import { ChainId } from '@swapr/sdk'

import BNBLogo from '../../assets/images/bnb-logo.png'
import EtherLogo from '../../assets/images/ether-logo.png'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import XDAILogo from '../../assets/images/xdai-logo.png'

export const NATIVE_CURRENCY_LOGO: { [chainId in ChainId]: string } = {
  [ChainId.ARBITRUM_GOERLI]: EtherLogo,
  [ChainId.ARBITRUM_ONE]: EtherLogo,
  [ChainId.ARBITRUM_RINKEBY]: EtherLogo,
  [ChainId.POLYGON]: PolygonMaticLogo,
  [ChainId.BSC_MAINNET]: BNBLogo,
  [ChainId.BSC_TESTNET]: BNBLogo,
  [ChainId.GOERLI]: EtherLogo,
  [ChainId.MAINNET]: EtherLogo,
  [ChainId.OPTIMISM_GOERLI]: EtherLogo,
  [ChainId.OPTIMISM_MAINNET]: EtherLogo,
  [ChainId.RINKEBY]: EtherLogo,
  [ChainId.SCROLL_MAINNET]: EtherLogo,
  [ChainId.XDAI]: XDAILogo,
  [ChainId.ZK_SYNC_ERA_MAINNET]: EtherLogo,
  [ChainId.ZK_SYNC_ERA_TESTNET]: EtherLogo,
}

// From repo https://github.com/trustwallet/assets/tree/master/blockchains
const trustWalletChainMapping: { [chainId in ChainId]?: string } = {
  [ChainId.ARBITRUM_ONE]: 'arbitrum',
  [ChainId.BSC_MAINNET]: 'binance',
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.OPTIMISM_MAINNET]: 'optimism',
  [ChainId.POLYGON]: 'polygon',
  [ChainId.SCROLL_MAINNET]: 'scroll',
  [ChainId.XDAI]: 'xdai',
  [ChainId.ZK_SYNC_ERA_MAINNET]: 'zksync',
}

export const getTokenLogoURL = (address: string, chainId = ChainId.MAINNET) => {
  const chainKey = trustWalletChainMapping[chainId] || 'ethereum'

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainKey}/assets/${address}/logo.png`
}
