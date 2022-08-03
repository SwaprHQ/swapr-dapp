import { ChainId } from '@swapr/sdk'

import { Connector } from '@web3-react/types'
import { networkConnection, walletConnectConnection } from 'connectors'
import { isChainAllowed } from 'connectors/utils'
import { useCallback } from 'react'
import { getNetworkInfo } from 'utils/networksList'

import { useWeb3ReactCore } from './useWeb3ReactCore'

export const switchNetwork = async (connector: Connector, chainId: ChainId) => {
  if (!isChainAllowed(connector, chainId)) {
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)
  } else if (connector === walletConnectConnection.connector || connector === networkConnection.connector) {
    await connector.activate(chainId)
  } else {
    const info = getNetworkInfo(chainId)
    const addChainParameter = {
      chainId,
      chainName: info.chainName,
      rpcUrls: info.rpcUrl,
      nativeCurrency: info.nativeCurrency,
      blockExplorerUrls: info.blockExplorerUrls,
    }
    await connector.activate(addChainParameter)
  }
}

export const useNetworkSwitch = () => {
  const { connector } = useWeb3ReactCore()

  const selectNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!connector) return

      try {
        await switchNetwork(connector, chainId)
      } catch (error) {
        console.error('Failed to switch networks', error)
      }
    },
    [connector]
  )

  return {
    selectNetwork,
  }
}
