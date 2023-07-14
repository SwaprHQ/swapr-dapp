import { ChainId } from '@swapr/sdk'

import { InjectedConnector } from '@web3-react/injected-connector'
import { providers } from 'ethers'

import swprLogo from '../assets/images/swpr-logo.png'
import { REFETCH_DATA_INTERVAL } from '../constants/data'
import getLibrary from '../utils/getLibrary'

import { CustomNetworkConnector } from './CustomNetworkConnector'
import { CustomWalletConnectConnector } from './CustomWalletConnectConnector'
import { CustomWalletLinkConnector } from './CustomWalletLinkConnector'

export const INFURA_PROJECT_ID = 'e1a3bfc40093494ca4f36b286ab36f2d'
/**
 * @TODO in https://linear.app/swaprdev/issue/SWA-65/provide-a-single-source-of-truth-for-chain-rpcs-from-the-sdk
 * Consume `RPC_PROVIDER_LIST` from the SDK and use it as single source of truth
 */
export const network = new CustomNetworkConnector({
  urls: {
    [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    [ChainId.XDAI]: 'https://rpc.gnosischain.com/',
    [ChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
    [ChainId.POLYGON]: 'https://polygon-rpc.com/',
    [ChainId.ARBITRUM_GOERLI]: 'https://goerli-rollup.arbitrum.io/rpc',
    [ChainId.OPTIMISM_MAINNET]: 'https://mainnet.optimism.io',
    [ChainId.OPTIMISM_GOERLI]: 'https://goerli.optimism.io',
    [ChainId.BSC_MAINNET]: 'https://bsc-dataseed.binance.org/',
    [ChainId.ZK_SYNC_ERA_MAINNET]: `https://mainnet.era.zksync.io`,
    [ChainId.ZK_SYNC_ERA_TESTNET]: `https://testnet.era.zksync.dev`,
  },
  defaultChainId: ChainId.MAINNET,
})

export const injected = new InjectedConnector({
  supportedChainIds: [
    ChainId.MAINNET,
    ChainId.RINKEBY,
    ChainId.ARBITRUM_ONE,
    ChainId.ARBITRUM_RINKEBY,
    ChainId.XDAI,
    ChainId.POLYGON,
    ChainId.ARBITRUM_GOERLI,
    ChainId.GOERLI,
    ChainId.OPTIMISM_MAINNET,
    ChainId.OPTIMISM_GOERLI,
    ChainId.BSC_MAINNET,
    ChainId.ZK_SYNC_ERA_MAINNET,
    ChainId.ZK_SYNC_ERA_TESTNET,
  ],
})

// mainnet only
export const walletConnect = new CustomWalletConnectConnector({
  rpc: {
    [ChainId.BSC_MAINNET]: 'https://bsc-dataseed.binance.org/',
    [ChainId.OPTIMISM_MAINNET]: 'https://mainnet.optimism.io',
    [ChainId.POLYGON]: 'https://polygon-rpc.com',
    [ChainId.ARBITRUM_ONE]: 'https://arb1.arbitrum.io/rpc',
    [ChainId.XDAI]: 'https://rpc.gnosischain.com/',
    [ChainId.MAINNET]: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    [ChainId.ZK_SYNC_ERA_MAINNET]: `https://mainnet.era.zksync.io`,
  },
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true,
  pollingInterval: REFETCH_DATA_INTERVAL,
})

let networkLibrary: providers.Web3Provider | undefined
export function getNetworkLibrary(): providers.Web3Provider {
  return (networkLibrary = networkLibrary ?? getLibrary(network.provider))
}

// walletLink implements Metamask's RPC and should respond to most it's methods: window.ethereum.isMetaMask === true
// More info: https://github.com/walletlink/walletlink
export const walletLink = new CustomWalletLinkConnector({
  url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
  appName: 'Swapr',
  appLogoUrl: swprLogo,
  supportedChainIds: [
    ChainId.MAINNET,
    ChainId.RINKEBY,
    ChainId.ARBITRUM_ONE,
    ChainId.ARBITRUM_RINKEBY,
    ChainId.XDAI,
    ChainId.POLYGON,
    ChainId.ARBITRUM_GOERLI,
    ChainId.OPTIMISM_MAINNET,
    ChainId.OPTIMISM_GOERLI,
    ChainId.BSC_MAINNET,
    ChainId.ZK_SYNC_ERA_MAINNET,
    ChainId.ZK_SYNC_ERA_TESTNET,
  ],
})
