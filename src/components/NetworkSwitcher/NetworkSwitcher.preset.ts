import { ChainId } from '@swapr/sdk'

import EthereumLogo from '../../assets/svg/ethereum-logo.svg'
import ArbitrumLogo from '../../assets/svg/arbitrum-one-logo.svg'
import GnosisLogo from '../../assets/svg/gnosis-chain-logo.svg'
import PolygonMaticLogo from '../../assets/images/polygon-matic-logo.svg'
import { NetworkOptionsPreset, NetworkSwitcherTags } from './NetworkSwitcher.types'

export const networkOptionsPreset: NetworkOptionsPreset[] = [
  // no tag - mainnets
  {
    chainId: ChainId.MAINNET,
    name: 'Ethereum',
    logoSrc: EthereumLogo,
    color: '#627EEA',
  },
  {
    chainId: ChainId.ARBITRUM_ONE,
    name: 'Arbitrum one',
    logoSrc: ArbitrumLogo,
    color: '#2C374B',
  },
  {
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    logoSrc: PolygonMaticLogo,
    color: '#8361DE',
    tag: NetworkSwitcherTags.COMING_SOON,
  },

  // TESTNETS
  {
    chainId: ChainId.RINKEBY,
    name: 'Rinkeby',
    logoSrc: EthereumLogo,
    color: '#443780',
    tag: NetworkSwitcherTags.TESTNETS,
  },
  {
    chainId: ChainId.ARBITRUM_RINKEBY,
    name: 'A.\xa0Rinkeby',
    logoSrc: ArbitrumLogo,
    color: '#b1a5e6',
    tag: NetworkSwitcherTags.TESTNETS,
  },
  {
    chainId: ChainId.XDAI,
    name: 'Gnosis Chain',
    logoSrc: GnosisLogo,
    color: '#49A9A7',
  },
]
