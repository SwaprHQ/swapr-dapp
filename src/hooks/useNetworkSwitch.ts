import { ChainId } from '@swapr/sdk'

import { Connector } from '@web3-react/types'
import { networkConnection, walletConnectConnection } from 'connectors'
import { getConnection, isChainSupportedByConnector } from 'connectors/utils'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { setConnectorError } from 'state/application/actions'
import { getErrorMessage } from 'utils/getErrorMessage'
import { getNetworkInfo } from 'utils/networksList'

import { useWeb3ReactCore } from './useWeb3ReactCore'

const switchNetwork = async (connector: Connector, chainId: ChainId) => {
  if (!isChainSupportedByConnector(connector, chainId)) {
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
  const dispatch = useDispatch<AppDispatch>()

  const selectNetwork = useCallback(
    async (chainId: ChainId) => {
      if (!connector) return

      try {
        await switchNetwork(connector, chainId)
        dispatch(setConnectorError({ connector: getConnection(connector).type, connectorError: undefined }))
      } catch (error) {
        console.error('Failed to switch networks', error)
        dispatch(
          setConnectorError({ connector: getConnection(connector).type, connectorError: getErrorMessage(error) })
        )
      }
    },
    [connector, dispatch]
  )

  return {
    selectNetwork,
  }
}
