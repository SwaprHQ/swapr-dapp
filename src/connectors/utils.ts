import { Connector } from '@web3-react/types'

import { ConnectorType, SUPPORTED_NETWORKS } from './../constants'

import {
  coinbaseWalletConnection,
  CONNECTIONS,
  // injectedConnection,
  metaMaskConnection,
  networkConnection,
  walletConnectConnection,
} from './index'

export const getIsInjected = (): boolean => {
  return Boolean(window.ethereum)
}

export const getIsMetaMask = (): boolean => {
  return window.ethereum?.isMetaMask ?? false
}

export const getIsCoinbaseWallet = (): boolean => {
  return window.ethereum?.isCoinbaseWallet ?? false
}

export const getConnection = (c: Connector | ConnectorType) => {
  if (c instanceof Connector) {
    const connection = CONNECTIONS.find(connection => connection.connector === c)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (c) {
      // case ConnectorType.INJECTED:
      //   return
      case ConnectorType.METAMASK:
        return metaMaskConnection
      case ConnectorType.COINBASE:
        return coinbaseWalletConnection
      case ConnectorType.WALLET_CONNECT:
        return walletConnectConnection
      case ConnectorType.NETWORK:
        return networkConnection
    }
  }
}

export const getConnectionName = (connector: ConnectorType, isMetaMask?: boolean) => {
  switch (connector) {
    // case ConnectorType.INJECTED:
    //   return isMetaMask ? 'MetaMask' : 'Injected'
    case ConnectorType.METAMASK:
      return 'MetaMask'
    case ConnectorType.COINBASE:
      return 'Coinbase Wallet'
    case ConnectorType.WALLET_CONNECT:
      return 'WalletConnect'
    case ConnectorType.NETWORK:
      return 'Network'
  }
}

export const isChainSupportedByConnector = (connector: Connector, chainId: number | undefined) => {
  const connectorType = getConnection(connector).type
  if (!chainId || !connectorType) return false
  return SUPPORTED_NETWORKS[connectorType].includes(chainId)
}
