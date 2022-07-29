import { Connector } from '@web3-react/types'

import { SUPPORTED_NETWORKS, WalletType } from './../constants'

import {
  coinbaseWalletConnection,
  CONNECTIONS,
  // injectedConnection,
  metaMaskConnection,
  networkConnection,
  walletConnectConnection,
} from './index'

export function getIsInjected(): boolean {
  return Boolean(window.ethereum)
}

export function getIsMetaMask(): boolean {
  return window.ethereum?.isMetaMask ?? false
}

export function getIsCoinbaseWallet(): boolean {
  return window.ethereum?.isCoinbaseWallet ?? false
}

export function getConnection(c: Connector | WalletType) {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find(connection => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      // case WalletType.INJECTED:
      //   return
      case WalletType.METAMASK:
        return metaMaskConnection
      case WalletType.COINBASE:
        return coinbaseWalletConnection
      case WalletType.WALLET_CONNECT:
        return walletConnectConnection
      case WalletType.NETWORK:
        return networkConnection
    }
  }
}

export function getConnectionName(walletType: WalletType, isMetaMask?: boolean) {
  switch (walletType) {
    // case WalletType.INJECTED:
    //   return isMetaMask ? 'MetaMask' : 'Injected'
    case WalletType.METAMASK:
      return 'MetaMask'
    case WalletType.COINBASE:
      return 'Coinbase Wallet'
    case WalletType.WALLET_CONNECT:
      return 'WalletConnect'
    case WalletType.NETWORK:
      return 'Network'
  }
}

export function isChainAllowed(connector: Connector, chainId: number | undefined) {
  const wallet = getConnection(connector).type
  if (!chainId || !wallet) return false
  return SUPPORTED_NETWORKS[wallet].includes(chainId)
}
