import {
  ChainId,
  Currency,
  CurrencyAmount,
  DAI,
  DXD,
  GNO,
  JSBI,
  Percent,
  RoutablePlatform,
  SWPR,
  Token,
  UniswapV2RoutablePlatform,
  USDC,
  USDT,
  WBTC,
  WETH,
  WMATIC,
  WXDAI,
} from '@swapr/sdk'

import { AbstractConnector } from '@web3-react/abstract-connector'
import { providers } from 'ethers'
import { ReactNode } from 'react'

import OneInchLogo from '../assets/images/1inch-logo.svg'
import RightArrow from '../assets/images/arrow-right.svg'
import BaoswapLogo from '../assets/images/baoswap-logo.png'
import PancakeSwapLogo from '../assets/images/bunny-mono.png'
import Coinbase from '../assets/images/coinbase.svg'
import CoWLogo from '../assets/images/cow-protocol.svg'
import CurveLogo from '../assets/images/curve-logo.png'
import DFYNLogo from '../assets/images/dfyn-logo.svg'
import HoneyswapLogo from '../assets/images/honeyswap-logo.svg'
import LevinswapLogo from '../assets/images/levinswap-logo.svg'
import SwaprLogo from '../assets/images/logo.svg'
import ZeroXLogo from '../assets/images/logos/ZeroX.svg'
import Metamask from '../assets/images/metamask.png'
import QuickswapLogo from '../assets/images/quickswap-logo.png'
import SushiswapNewLogo from '../assets/images/sushiswap-new-logo.svg'
import UniswapLogo from '../assets/images/uniswap-logo.svg'
import VelodromeLogo from '../assets/images/velodrome-logo.svg'
import WalletConnect from '../assets/images/wallet-connect.svg'
import { injected, walletConnect, walletLink } from '../connectors'
import { BridgeIds, EcoBridgeConfig } from '../services/EcoBridge/EcoBridge.types'

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const SOCKET_NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

// a list of tokens by chain
type ChainTokenList = {
  readonly [chainId in ChainId]: Token[]
}

export const MATIC: { [key: number]: Token } = {
  [ChainId.MAINNET]: new Token(
    ChainId.MAINNET,
    '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
    18,
    'MATIC',
    'Matic Token'
  ),
  [ChainId.XDAI]: new Token(
    ChainId.XDAI,
    '0x7122d7661c4564b7C6Cd4878B06766489a6028A2',
    18,
    'MATIC',
    'Matic Token on xDai'
  ),
}

export const HONEY = new Token(ChainId.XDAI, '0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9', 18, 'HNY', 'Honey')

export const STAKE = new Token(
  ChainId.XDAI,
  '0xb7D311E2Eb55F2f68a9440da38e7989210b9A05e',
  18,
  'STAKE',
  'Stake Token on xDai'
)

export const BAO = new Token(
  ChainId.XDAI,
  '0x82dFe19164729949fD66Da1a37BC70dD6c4746ce',
  18,
  'BAO',
  'BaoToken from Ethereum'
)

export const AGAVE = new Token(ChainId.XDAI, '0x3a97704a1b25F08aa230ae53B352e2e72ef52843', 18, 'AGVE', 'Agave token')

export const OP: { [key: number]: Token } = {
  [ChainId.OPTIMISM_MAINNET]: new Token(
    ChainId.OPTIMISM_MAINNET,
    '0x4200000000000000000000000000000000000042',
    18,
    'OP',
    'Optimism'
  ),
}

/**
 * Used to store bridges details such as id, name and landing URL
 */
export const BRIDGES: Record<string, EcoBridgeConfig> = {
  ARBITRUM_MAINNET: {
    id: BridgeIds.ARBITRUM_MAINNET,
    name: 'Arbitrum One',
    url: 'https://bridge.arbitrum.io/',
  },
  ARBITRUM_TESTNET: {
    id: BridgeIds.ARBITRUM_TESTNET,
    name: 'Arbitrum Goerli',
    url: 'https://bridge.arbitrum.io/',
  },
  CONNEXT: {
    id: BridgeIds.CONNEXT,
    name: 'Connext Network',
    url: 'https://bridge.connext.network/',
  },
  LIFI: {
    id: BridgeIds.LIFI,
    name: 'Lifi',
    url: 'https://li.fi/',
  },
  OMNIBRIDGE: {
    id: BridgeIds.OMNIBRIDGE,
    name: 'OmniBridge',
    url: 'https://omnibridge.gnosischain.com/',
  },
  SOCKET: {
    id: BridgeIds.SOCKET,
    name: 'Socket Network',
    url: 'https://socket.tech/',
  },
  XDAI: {
    id: BridgeIds.XDAI,
    name: 'xDai Bridge',
    url: 'https://bridge.gnosischain.com/',
  },
}

export const PRE_SELECT_OUTPUT_CURRENCY_ID: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: DAI[ChainId.MAINNET].address,
  [ChainId.GNOSIS]: GNO.address,
  [ChainId.ARBITRUM_ONE]: USDC[ChainId.ARBITRUM_ONE].address,
  [ChainId.POLYGON]: WETH[ChainId.POLYGON].address,
  [ChainId.OPTIMISM_MAINNET]: OP[ChainId.OPTIMISM_MAINNET].address,
  [ChainId.BSC_MAINNET]: Token.BUSD[ChainId.BSC_MAINNET].address,
  [ChainId.RINKEBY]: '',
  [ChainId.ARBITRUM_RINKEBY]: '',
  [ChainId.GOERLI]: '',
  [ChainId.ARBITRUM_GOERLI]: '',
  [ChainId.OPTIMISM_GOERLI]: '',
  [ChainId.BSC_TESTNET]: '',
}

// used to construct intermediary pairs for trading
export const BASES_TO_CHECK_TRADES_AGAINST: ChainTokenList = {
  [ChainId.MAINNET]: [
    WETH[ChainId.MAINNET],
    DXD[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    WBTC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.ARBITRUM_ONE]: [
    WETH[ChainId.ARBITRUM_ONE],
    DXD[ChainId.ARBITRUM_ONE],
    USDC[ChainId.ARBITRUM_ONE],
    WBTC[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
  ],
  [ChainId.ARBITRUM_RINKEBY]: [WETH[ChainId.ARBITRUM_RINKEBY], DXD[ChainId.ARBITRUM_RINKEBY]],
  [ChainId.ARBITRUM_GOERLI]: [WETH[ChainId.ARBITRUM_GOERLI]],
  [ChainId.XDAI]: [
    WXDAI[ChainId.XDAI],
    WETH[ChainId.XDAI],
    DXD[ChainId.XDAI],
    USDC[ChainId.XDAI],
    USDT[ChainId.XDAI],
    WBTC[ChainId.XDAI],
    HONEY,
    STAKE,
    AGAVE,
    BAO,
  ],
  [ChainId.POLYGON]: [WMATIC[ChainId.POLYGON], USDC[ChainId.POLYGON], WBTC[ChainId.POLYGON], USDT[ChainId.POLYGON]],
  [ChainId.OPTIMISM_GOERLI]: [],
  [ChainId.OPTIMISM_MAINNET]: [
    USDC[ChainId.OPTIMISM_MAINNET],
    USDT[ChainId.OPTIMISM_MAINNET],
    WBTC[ChainId.OPTIMISM_MAINNET],
  ],
  [ChainId.GOERLI]: [],
  [ChainId.BSC_MAINNET]: [
    Token.BUSD[ChainId.BSC_MAINNET],
    Token.CAKE[ChainId.BSC_MAINNET],
    DAI[ChainId.BSC_MAINNET],
    Token.WBNB[ChainId.BSC_MAINNET],
    USDC[ChainId.BSC_MAINNET],
    USDT[ChainId.BSC_MAINNET],
  ],
  [ChainId.BSC_TESTNET]: [],
}

// used for display in the default list when adding liquidity (native currency is already shown
// by default, so no need to add the wrapper to the list)
export const SUGGESTED_BASES: ChainTokenList = {
  [ChainId.MAINNET]: [
    DXD[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
    WBTC[ChainId.MAINNET],
    SWPR[ChainId.MAINNET],
  ],
  [ChainId.RINKEBY]: [],
  [ChainId.ARBITRUM_ONE]: [
    WETH[ChainId.ARBITRUM_ONE],
    DXD[ChainId.ARBITRUM_ONE],
    SWPR[ChainId.ARBITRUM_ONE],
    WBTC[ChainId.ARBITRUM_ONE],
    USDC[ChainId.ARBITRUM_ONE],
    USDT[ChainId.ARBITRUM_ONE],
  ],
  [ChainId.ARBITRUM_RINKEBY]: [WETH[ChainId.ARBITRUM_RINKEBY], DXD[ChainId.ARBITRUM_RINKEBY]],
  [ChainId.ARBITRUM_GOERLI]: [WETH[ChainId.ARBITRUM_GOERLI]],
  [ChainId.XDAI]: [WXDAI[ChainId.XDAI], DXD[ChainId.XDAI], WETH[ChainId.XDAI], USDC[ChainId.XDAI], SWPR[ChainId.XDAI]],
  [ChainId.POLYGON]: [
    WMATIC[ChainId.POLYGON],
    WETH[ChainId.POLYGON],
    USDC[ChainId.POLYGON],
    WBTC[ChainId.POLYGON],
    USDT[ChainId.POLYGON],
  ],
  [ChainId.OPTIMISM_GOERLI]: [],
  [ChainId.OPTIMISM_MAINNET]: [
    OP[ChainId.OPTIMISM_MAINNET],
    DAI[ChainId.OPTIMISM_MAINNET],
    USDC[ChainId.OPTIMISM_MAINNET],
    USDT[ChainId.OPTIMISM_MAINNET],
    WBTC[ChainId.OPTIMISM_MAINNET],
  ],
  [ChainId.GOERLI]: [],
  [ChainId.BSC_MAINNET]: [
    Token.WBNB[ChainId.BSC_MAINNET],
    Token.BUSD[ChainId.BSC_MAINNET],
    Token.CAKE[ChainId.BSC_MAINNET],
    DAI[ChainId.BSC_MAINNET],
    USDC[ChainId.BSC_MAINNET],
    USDT[ChainId.BSC_MAINNET],
  ],
  [ChainId.BSC_TESTNET]: [],
}

// used to construct the list of all pairs we consider by default in the frontend
export const BASES_TO_TRACK_LIQUIDITY_FOR: ChainTokenList = {
  [ChainId.MAINNET]: [
    WETH[ChainId.MAINNET],
    DXD[ChainId.MAINNET],
    DAI[ChainId.MAINNET],
    USDC[ChainId.MAINNET],
    USDT[ChainId.MAINNET],
  ],
  [ChainId.RINKEBY]: [WETH[ChainId.RINKEBY]],
  [ChainId.ARBITRUM_ONE]: [WETH[ChainId.ARBITRUM_ONE], DXD[ChainId.ARBITRUM_ONE], USDC[ChainId.ARBITRUM_ONE]],
  [ChainId.ARBITRUM_RINKEBY]: [WETH[ChainId.ARBITRUM_RINKEBY], DXD[ChainId.ARBITRUM_RINKEBY]],
  [ChainId.ARBITRUM_GOERLI]: [WETH[ChainId.ARBITRUM_GOERLI]],
  [ChainId.XDAI]: [WXDAI[ChainId.XDAI], DXD[ChainId.XDAI], WETH[ChainId.XDAI], USDC[ChainId.XDAI], STAKE],
  [ChainId.POLYGON]: [WMATIC[ChainId.POLYGON], USDC[ChainId.POLYGON], WBTC[ChainId.POLYGON], USDT[ChainId.POLYGON]],
  [ChainId.OPTIMISM_GOERLI]: [WETH[ChainId.OPTIMISM_GOERLI]],
  [ChainId.OPTIMISM_MAINNET]: [WETH[ChainId.OPTIMISM_MAINNET]],
  [ChainId.GOERLI]: [WETH[ChainId.OPTIMISM_MAINNET]],
  [ChainId.BSC_MAINNET]: [Token.WBNB[ChainId.BSC_MAINNET]],
  [ChainId.BSC_TESTNET]: [Token.WBNB[ChainId.BSC_TESTNET]],
}

export const PINNED_PAIRS: {
  readonly [chainId in ChainId]?: [Token, Token][]
} = {
  [ChainId.MAINNET]: [
    [USDC[ChainId.MAINNET], USDT[ChainId.MAINNET]],
    [DAI[ChainId.MAINNET], USDT[ChainId.MAINNET]],
  ],
}

export const ARBITRUM_ONE_PROVIDER = new providers.JsonRpcProvider('https://arb1.arbitrum.io/rpc')

export interface WalletInfo {
  connector?: AbstractConnector
  name: string
  iconName: string
  description: string
  href: string | null
  color: string
  primary?: true
  mobile?: true
  mobileOnly?: true
}

export const SUPPORTED_WALLETS: { [key: string]: WalletInfo } = {
  INJECTED: {
    connector: injected,
    name: 'Injected',
    iconName: RightArrow,
    description: 'Injected web3 provider.',
    href: null,
    color: '#010101',
    primary: true,
  },
  METAMASK: {
    connector: injected,
    name: 'MetaMask',
    iconName: Metamask,
    description: 'Easy-to-use browser extension.',
    href: null,
    color: '#E8831D',
    mobile: true,
  },
  WALLET_CONNECT: {
    connector: walletConnect,
    name: 'WalletConnect',
    iconName: WalletConnect,
    description: 'Connect to Trust Wallet, Rainbow Wallet and more...',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
  COINBASE: {
    connector: walletLink,
    name: 'Coinbase Wallet',
    iconName: Coinbase,
    description: 'Connect using Coinbase Wallet.',
    href: null,
    color: '#4196FC',
    mobile: true,
  },
}

export const NetworkContextName = 'NETWORK'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20
export const DEFAULT_USER_MULTIHOP_ENABLED = true

export const BIG_INT_ZERO = JSBI.BigInt(0)

// one basis point
export const ONE_BIPS = new Percent(JSBI.BigInt(1), JSBI.BigInt(10000))
export const BIPS_BASE = JSBI.BigInt(10000)
// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(JSBI.BigInt(100), BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(JSBI.BigInt(300), BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(500), BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(JSBI.BigInt(1000), BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(JSBI.BigInt(1500), BIPS_BASE) // 15%
// used for fiat warning states
export const ALLOWED_FIAT_PRICE_IMPACT_HIGH: Percent = new Percent(JSBI.BigInt(200), BIPS_BASE) // 2%
// price impact numeric values
export const PRICE_IMPACT_NON_EXPERT = 4
export const PRICE_IMPACT_HIGH = 3
export const PRICE_IMPACT_MEDIUM = 2
export const PRICE_IMPACT_LOW = 1
export const NO_PRICE_IMPACT = 0

// used to ensure the user doesn't send so much ETH so they end up with <.01
export const MIN_ETH: JSBI = JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(16)) // .01 ETH

export const DEFAULT_TOKEN_LIST = 'ipfs://QmU4sW7YZqS8BCSUuo6zaqDxmbpKZRQWJVM4BPjwEgEZPn'

export const DOLLAR_AMOUNT_MAX_SIMULATION = 10000000
export const ZERO_USD = CurrencyAmount.usd('0')

export interface NetworkDetails {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

export interface NetworkOptionalDetails {
  iconUrls?: string[] // Currently ignored.
  partnerChainId?: ChainId //arbitrum chainId if supported
  isArbitrum: boolean
}

export const NETWORK_DETAIL: { [chainId: number]: NetworkDetails } = {
  [ChainId.MAINNET]: {
    chainId: `0x${ChainId.MAINNET.toString(16)}`,
    chainName: 'Ethereum mainnet',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://mainnet.infura.io/v3'],
    blockExplorerUrls: ['https://etherscan.io'],
  },
  [ChainId.XDAI]: {
    chainId: `0x${ChainId.XDAI.toString(16)}`,
    chainName: 'Gnosis Chain',
    nativeCurrency: {
      name: Currency.XDAI.name || 'xDAI',
      symbol: Currency.XDAI.symbol || 'xDAI',
      decimals: Currency.XDAI.decimals || 18,
    },
    rpcUrls: ['https://rpc.gnosischain.com/'],
    blockExplorerUrls: ['https://gnosisscan.io'],
  },
  [ChainId.ARBITRUM_ONE]: {
    chainId: `0x${ChainId.ARBITRUM_ONE.toString(16)}`,
    chainName: 'Arbitrum One',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://explorer.arbitrum.io'],
  },
  [ChainId.ARBITRUM_RINKEBY]: {
    chainId: `0x${ChainId.ARBITRUM_RINKEBY.toString(16)}`,
    chainName: 'Arbitrum Rinkeby',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://rinkeby.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://rinkeby-explorer.arbitrum.io'],
  },
  [ChainId.ARBITRUM_GOERLI]: {
    chainId: `0x${ChainId.ARBITRUM_GOERLI.toString(16)}`,
    chainName: 'Arbitrum Goerli',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://goerli-rollup.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://goerli-rollup-explorer.arbitrum.io/'],
  },
  [ChainId.RINKEBY]: {
    chainId: `0x${ChainId.RINKEBY.toString(16)}`,
    chainName: 'Rinkeby',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://rinkeby.infura.io/v3'],
    blockExplorerUrls: ['https://rinkeby.etherscan.io'],
  },
  [ChainId.GOERLI]: {
    chainId: `0x${ChainId.GOERLI.toString(16)}`,
    chainName: 'Görli',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://goerli.infura.io/v3'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
  },
  [ChainId.POLYGON]: {
    chainId: `0x${ChainId.POLYGON.toString(16)}`,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: Currency.MATIC.name || 'Matic',
      symbol: Currency.MATIC.symbol || 'MATIC',
      decimals: Currency.MATIC.decimals || 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  [ChainId.OPTIMISM_MAINNET]: {
    chainId: `0x${ChainId.OPTIMISM_MAINNET.toString(16)}`,
    chainName: 'Optimism Mainnet',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://opt-mainnet.g.alchemy.com/v2/6cRVjVO2uOTC9gWFCsBnquUwOM9zuWQZ'],
    blockExplorerUrls: ['https://optimistic.etherscan.io/'],
  },
  [ChainId.OPTIMISM_GOERLI]: {
    chainId: `0x${ChainId.OPTIMISM_GOERLI.toString(16)}`,
    chainName: 'Optimism Goerli Testnet',
    nativeCurrency: {
      name: Currency.ETHER.name || 'Ether',
      symbol: Currency.ETHER.symbol || 'ETH',
      decimals: Currency.ETHER.decimals || 18,
    },
    rpcUrls: ['https://goerli.optimism.io'],
    blockExplorerUrls: ['https://blockscout.com/optimism/goerli'],
  },
  [ChainId.BSC_MAINNET]: {
    chainId: `0x${ChainId.BSC_MAINNET.toString(16)}`,
    chainName: 'BSC Mainnet',
    nativeCurrency: {
      name: Currency.BNB.name || 'Binance Coin',
      symbol: Currency.BNB.symbol || 'BNB',
      decimals: Currency.BNB.decimals || 18,
    },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  [ChainId.BSC_TESTNET]: {
    chainId: `0x${ChainId.BSC_TESTNET.toString(16)}`,
    chainName: 'BSC Testnet',
    nativeCurrency: {
      name: Currency.BNB.name || 'Binance Coin',
      symbol: Currency.BNB.symbol || 'BNB',
      decimals: Currency.BNB.decimals || 18,
    },
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
    blockExplorerUrls: ['https://testnet.bscscan.com/'],
  },
}

export const NETWORK_OPTIONAL_DETAIL: {
  [chainId: number]: NetworkOptionalDetails
} = {
  [ChainId.MAINNET]: {
    partnerChainId: ChainId.ARBITRUM_ONE,
    isArbitrum: false,
  },
  [ChainId.XDAI]: {
    isArbitrum: false,
  },
  [ChainId.ARBITRUM_ONE]: {
    partnerChainId: ChainId.MAINNET,
    isArbitrum: true,
  },
  [ChainId.OPTIMISM_MAINNET]: {
    partnerChainId: ChainId.MAINNET,
    isArbitrum: false,
  },
  [ChainId.BSC_MAINNET]: {
    partnerChainId: ChainId.BSC_MAINNET,
    isArbitrum: false,
  },
  [ChainId.ARBITRUM_RINKEBY]: {
    partnerChainId: ChainId.RINKEBY,
    isArbitrum: true,
  },
  [ChainId.RINKEBY]: {
    partnerChainId: ChainId.ARBITRUM_RINKEBY,
    isArbitrum: false,
  },
  [ChainId.OPTIMISM_GOERLI]: {
    partnerChainId: ChainId.OPTIMISM_GOERLI,
    isArbitrum: false,
  },
  [ChainId.GOERLI]: {
    partnerChainId: ChainId.ARBITRUM_GOERLI,
    isArbitrum: false,
  },
  [ChainId.ARBITRUM_GOERLI]: {
    partnerChainId: ChainId.GOERLI,
    isArbitrum: true,
  },
}

export const RoutablePlatformKeysByNetwork = {
  [ChainId.MAINNET]: [
    UniswapV2RoutablePlatform.SWAPR.name,
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    RoutablePlatform.ZEROX.name,
    RoutablePlatform.GNOSIS_PROTOCOL.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.ARBITRUM_ONE]: [
    UniswapV2RoutablePlatform.SWAPR.name,
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.XDAI]: [
    UniswapV2RoutablePlatform.SWAPR.name,
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    UniswapV2RoutablePlatform.HONEYSWAP.name,
    UniswapV2RoutablePlatform.LEVINSWAP.name,
    UniswapV2RoutablePlatform.BAOSWAP.name,
    RoutablePlatform.CURVE.name,
    RoutablePlatform.GNOSIS_PROTOCOL.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.POLYGON]: [
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    UniswapV2RoutablePlatform.QUICKSWAP.name,
    UniswapV2RoutablePlatform.DFYN.name,
    RoutablePlatform.ZEROX.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.OPTIMISM_MAINNET]: [
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    RoutablePlatform.CURVE.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.BSC_MAINNET]: [
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    UniswapV2RoutablePlatform.PANCAKESWAP.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  // TEST NETS WITH ALL DEXES
  [ChainId.RINKEBY]: [
    UniswapV2RoutablePlatform.SWAPR.name,
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    UniswapV2RoutablePlatform.HONEYSWAP.name,
    UniswapV2RoutablePlatform.LEVINSWAP.name,
    UniswapV2RoutablePlatform.BAOSWAP.name,
    RoutablePlatform.CURVE.name,
  ],
  [ChainId.ARBITRUM_RINKEBY]: [
    UniswapV2RoutablePlatform.SWAPR.name,
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    UniswapV2RoutablePlatform.HONEYSWAP.name,
    UniswapV2RoutablePlatform.LEVINSWAP.name,
    UniswapV2RoutablePlatform.BAOSWAP.name,
    RoutablePlatform.CURVE.name,
  ],
  [ChainId.ARBITRUM_GOERLI]: [],
  [ChainId.GOERLI]: [],
  [ChainId.OPTIMISM_GOERLI]: [],
  [ChainId.OPTIMISM_MAINNET]: [
    RoutablePlatform.UNISWAP.name,
    UniswapV2RoutablePlatform.SUSHISWAP.name,
    RoutablePlatform.CURVE.name,
    RoutablePlatform.VELODROME.name,
    RoutablePlatform.ONE_INCH.name,
  ],
  [ChainId.BSC_TESTNET]: [],
}

export const ROUTABLE_PLATFORM_STYLE: {
  [routablePaltformName: string]: {
    logo: string
    alt: string
    gradientColor: string
    name: string
  }
} = {
  [UniswapV2RoutablePlatform.UNISWAP.name]: {
    logo: UniswapLogo,
    alt: UniswapV2RoutablePlatform.UNISWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.UNISWAP.name,
  },
  [UniswapV2RoutablePlatform.SUSHISWAP.name]: {
    logo: SushiswapNewLogo,
    alt: UniswapV2RoutablePlatform.SUSHISWAP.name,
    gradientColor: '#FB52A1',
    name: 'Sushi',
  },
  [UniswapV2RoutablePlatform.SWAPR.name]: {
    logo: SwaprLogo,
    alt: UniswapV2RoutablePlatform.SWAPR.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.SWAPR.name,
  },
  [UniswapV2RoutablePlatform.HONEYSWAP.name]: {
    logo: HoneyswapLogo,
    alt: UniswapV2RoutablePlatform.HONEYSWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.HONEYSWAP.name,
  },
  [UniswapV2RoutablePlatform.BAOSWAP.name]: {
    logo: BaoswapLogo,
    alt: UniswapV2RoutablePlatform.BAOSWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.BAOSWAP.name,
  },
  [UniswapV2RoutablePlatform.LEVINSWAP.name]: {
    logo: LevinswapLogo,
    alt: UniswapV2RoutablePlatform.LEVINSWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.LEVINSWAP.name,
  },
  [UniswapV2RoutablePlatform.QUICKSWAP.name]: {
    logo: QuickswapLogo,
    alt: UniswapV2RoutablePlatform.QUICKSWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.QUICKSWAP.name,
  },
  [UniswapV2RoutablePlatform.DFYN.name]: {
    logo: DFYNLogo,
    alt: UniswapV2RoutablePlatform.DFYN.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.DFYN.name,
  },
  [UniswapV2RoutablePlatform.PANCAKESWAP.name]: {
    logo: PancakeSwapLogo,
    alt: UniswapV2RoutablePlatform.PANCAKESWAP.name,
    gradientColor: '#FB52A1',
    name: UniswapV2RoutablePlatform.PANCAKESWAP.name,
  },
  [RoutablePlatform.CURVE.name]: {
    logo: CurveLogo,
    alt: RoutablePlatform.CURVE.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.CURVE.name,
  },
  [RoutablePlatform.ZEROX.name]: {
    logo: ZeroXLogo,
    alt: RoutablePlatform.ZEROX.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.ZEROX.name,
  },
  [RoutablePlatform.GNOSIS_PROTOCOL.name]: {
    logo: CoWLogo,
    alt: RoutablePlatform.GNOSIS_PROTOCOL.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.GNOSIS_PROTOCOL.name,
  },
  [RoutablePlatform.UNISWAP.name]: {
    logo: UniswapLogo,
    alt: RoutablePlatform.UNISWAP.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.UNISWAP.name,
  },
  [RoutablePlatform.VELODROME.name]: {
    logo: VelodromeLogo,
    alt: RoutablePlatform.VELODROME.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.VELODROME.name,
  },
  [RoutablePlatform.ONE_INCH.name]: {
    logo: OneInchLogo,
    alt: RoutablePlatform.ONE_INCH.name,
    gradientColor: '#FB52A1',
    name: RoutablePlatform.ONE_INCH.name,
  },
}

export const ROUTABLE_PLATFORM_LOGO: {
  [routablePaltformName: string]: ReactNode
} = {
  [UniswapV2RoutablePlatform.UNISWAP.name]: <img width={16} height={16} src={UniswapLogo} alt="uniswap" />,
  [UniswapV2RoutablePlatform.SUSHISWAP.name]: <img width={16} height={16} src={SushiswapNewLogo} alt="sushiswap" />,
  [UniswapV2RoutablePlatform.SWAPR.name]: <img width={16} height={16} src={SwaprLogo} alt="swapr" />,
  [UniswapV2RoutablePlatform.HONEYSWAP.name]: <img width={16} height={16} src={HoneyswapLogo} alt="honeyswap" />,
  [UniswapV2RoutablePlatform.BAOSWAP.name]: <img width={16} height={16} src={BaoswapLogo} alt="baoswap" />,
  [UniswapV2RoutablePlatform.LEVINSWAP.name]: <img width={16} height={16} src={LevinswapLogo} alt="levinswap" />,
  [UniswapV2RoutablePlatform.QUICKSWAP.name]: <img width={16} height={16} src={QuickswapLogo} alt="quickswap" />,
  [UniswapV2RoutablePlatform.DFYN.name]: <img width={16} height={16} src={DFYNLogo} alt="dfyn" />,
  [UniswapV2RoutablePlatform.PANCAKESWAP.name]: <img width={16} height={16} src={PancakeSwapLogo} alt="pancakeswap" />,
  [RoutablePlatform.CURVE.name]: <img width={16} height={16} src={CurveLogo} alt="Curve" />,
  [RoutablePlatform.ZEROX.name]: <img width={16} height={16} src={ZeroXLogo} alt="ZeroX" />,
  [RoutablePlatform.GNOSIS_PROTOCOL.name]: <img width={16} height={16} src={CoWLogo} alt="CoW" />,
  [RoutablePlatform.VELODROME.name]: <img width={16} height={16} src={VelodromeLogo} alt="Velodrome" />,
  [RoutablePlatform.UNISWAP.name]: <img width={16} height={16} src={UniswapLogo} alt="Uniswap Unicorn" />,
  [RoutablePlatform.ONE_INCH.name]: <img width={16} height={16} src={OneInchLogo} alt="One Inch" />,
}

export const ChainLabel: any = {
  [ChainId.MAINNET]: 'Ethereum',
  [ChainId.RINKEBY]: 'Rinkeby',
  [ChainId.ARBITRUM_ONE]: 'Arbitrum One',
  [ChainId.ARBITRUM_RINKEBY]: 'Arbitrum Rinkeby',
  [ChainId.XDAI]: 'Gnosis Chain',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.OPTIMISM_MAINNET]: 'Optimism',
  [ChainId.BSC_MAINNET]: 'Binance Chain',
}

export const OLD_SWPR: { [key: number]: Token } = {
  [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xe54942077Df7b8EEf8D4e6bCe2f7B58B0082b0cd', 18, 'SWPR', 'Swapr'),
  [ChainId.ARBITRUM_ONE]: new Token(
    ChainId.ARBITRUM_ONE,
    '0x955b9fe60a5b5093df9Dc4B1B18ec8e934e77162',
    18,
    'SWPR',
    'Swapr'
  ),
  [ChainId.RINKEBY]: new Token(ChainId.RINKEBY, '0xA271cCbC126a41f04BAe8fdBDbCEfCF10Bf59a48', 18, 'SWPR', 'Swapr'),
  [ChainId.ARBITRUM_RINKEBY]: new Token(
    ChainId.ARBITRUM_RINKEBY,
    '0xFe45504a21EA46C194000403B43f6DDBA2DCcC80',
    18,
    'SWPR',
    'Swapr'
  ),
}

export const TESTNETS = [
  ChainId.RINKEBY,
  ChainId.ARBITRUM_RINKEBY,
  ChainId.ARBITRUM_GOERLI,
  ChainId.OPTIMISM_GOERLI,
  ChainId.GOERLI,
  ChainId.BSC_TESTNET,
]

export const SHOW_TESTNETS = false

// addresses to filter by when querying for verified KPI tokens
export const KPI_TOKEN_CREATORS: { [key: number]: string[] } = {
  [ChainId.XDAI]: ['0xe716ec63c5673b3a4732d22909b38d779fa47c3f', '0x9467dcfd4519287e3878c018c02f5670465a9003'],
  [ChainId.RINKEBY]: ['0x1A639b50D807ce7e61Dc9eeB091e6Cea8EcB1595', '0xb4124ceb3451635dacedd11767f004d8a28c6ee7'],
}

export const LIQUIDITY_SORTING_TYPES: { [key: string]: string } = {
  TVL: 'TVL',
  APY: 'APY',
  NEW: 'NEW',
}

export const SWAP_INPUT_ERRORS: Record<string, number> = {
  CONNECT_WALLET: 1,
  ENTER_AMOUNT: 2,
  SELECT_TOKEN: 3,
  ENTER_RECIPIENT: 4,
  INVALID_RECIPIENT: 5,
  INSUFFICIENT_BALANCE: 6,
}
