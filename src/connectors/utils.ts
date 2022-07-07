import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import type { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'

export function getName(connector: Connector) {
  if (connector instanceof MetaMask) return 'MetaMask'
  if (connector instanceof WalletConnect) return 'WalletConnect'
  if (connector instanceof CoinbaseWallet) return 'Coinbase Wallet'
  return 'Unknown'
}
