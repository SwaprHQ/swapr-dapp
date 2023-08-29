import { ChainId } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { initializeConnector } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect-v2'

export const INFURA_PROJECT_ID = 'e1a3bfc40093494ca4f36b286ab36f2d'

export const [network, networkHooks] = initializeConnector<Network>(
  actions =>
    new Network({
      actions,
      urlMap: {
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
    })
)

export const [metaMask, metaMaskHooks] = initializeConnector<MetaMask>(actions => new MetaMask({ actions }))

export const [walletConnect, walletConnectHooks] = initializeConnector<WalletConnect>(
  actions =>
    new WalletConnect({
      actions,
      options: {
        projectId: process.env.REACT_APP_WALLET_CONNECT_ID as string,
        chains: [ChainId.MAINNET],
        optionalChains: [
          ChainId.RINKEBY,
          ChainId.ARBITRUM_ONE,
          ChainId.ARBITRUM_RINKEBY,
          ChainId.GNOSIS,
          ChainId.POLYGON,
          ChainId.ARBITRUM_GOERLI,
          ChainId.OPTIMISM_MAINNET,
          ChainId.OPTIMISM_GOERLI,
          ChainId.BSC_MAINNET,
          ChainId.ZK_SYNC_ERA_MAINNET,
          ChainId.ZK_SYNC_ERA_TESTNET,
        ],
        showQrModal: true,
      },
    })
)

export const [coinbaseWallet, coinbaseWalletHooks] = initializeConnector<CoinbaseWallet>(
  actions =>
    new CoinbaseWallet({
      actions,
      options: {
        url: `https://mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        appName: 'web3-react',
      },
    })
)
