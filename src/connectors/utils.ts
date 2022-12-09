import { ChainId } from '@swapr/sdk'

import { Connector } from '@web3-react/types'

import { ConnectorType, SUPPORTED_NETWORKS, SUPPORTED_WALLETS } from './../constants'

import {
  coinbaseWalletConnection,
  CONNECTIONS,
  metaMaskConnection,
  networkConnection,
  walletConnectConnection,
} from './index'

export const getIsInjected = () => Boolean(window.ethereum)

export const getIsMetaMask = () => !!window.ethereum?.isMetaMask

export const getIsCoinbaseWallet = () =>
  !!(window.ethereum?.isCoinbaseWallet || window.ethereum?.selectedProvider?.isCoinbaseWallet)

export const getConnection = (connector: Connector | ConnectorType) => {
  if (connector instanceof Connector) {
    const connection = CONNECTIONS.find(connection => connection.connector === connector)
    if (!connection) {
      throw Error('unsupported connector')
    }
    return connection
  }

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

export const getConnectionName = (connector: ConnectorType) => SUPPORTED_WALLETS[connector].name

export const isChainSupportedByConnector = (connector: Connector | ConnectorType, chainId: ChainId | undefined) => {
  if (!chainId) return false
  if (connector instanceof Connector) {
    const connectorType = getConnection(connector).type
    return SUPPORTED_NETWORKS[connectorType].includes(chainId)
  }

  return SUPPORTED_NETWORKS[connector].includes(chainId)
}
