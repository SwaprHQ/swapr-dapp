import { Connector } from '@web3-react/types'

import { ConnectorType, SUPPORTED_NETWORKS } from './../constants'

import {
  coinbaseWalletConnection,
  CONNECTIONS,
  metaMaskConnection,
  networkConnection,
  walletConnectConnection,
} from './index'

export const getIsInjected = () => Boolean(window.ethereum)

export const getIsMetaMask = () => window.ethereum?.isMetaMask ?? false

export const getIsCoinbaseWallet = () =>
  (window.ethereum?.isCoinbaseWallet || window.ethereum?.selectedProvider?.isCoinbaseWallet) ?? false

export const getConnection = (connector: Connector | ConnectorType) => {
  if (connector instanceof Connector) {
    const connection = CONNECTIONS.find(connection => connection.connector === connector)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  } else {
    switch (connector) {
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

export const getConnectionName = (connector: ConnectorType) => {
  switch (connector) {
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
