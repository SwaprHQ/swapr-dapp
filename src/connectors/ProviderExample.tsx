import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks, Web3ReactProvider } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'

import { coinbaseWallet, hooks as coinbaseWalletHooks } from '../connectors/coinbaseWallet'
import { metaMask, hooks as metaMaskHooks } from '../connectors/metaMask'
import { network, hooks as networkHooks } from '../connectors/network'
import { walletConnect, hooks as walletConnectHooks } from '../connectors/walletConnect'
import { getName } from './utils'

const connectors: [MetaMask | WalletConnect | CoinbaseWallet | Network, Web3ReactHooks][] = [
  [metaMask, metaMaskHooks],
  [walletConnect, walletConnectHooks],
  [coinbaseWallet, coinbaseWalletHooks],
  [network, networkHooks],
]
