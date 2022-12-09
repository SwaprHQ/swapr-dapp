import { ChainId, SWPR } from '@swapr/sdk'

import { Connector } from '@web3-react/types'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom'

import { networkConnection, walletConnectConnection } from '../connectors'
import { getConnection, isChainSupportedByConnector } from '../connectors/utils'
import { AppDispatch } from '../state'
import { setConnectorError } from '../state/user/actions'
import { getErrorMessage } from '../utils/getErrorMessage'
import { getNetworkInfo } from '../utils/networksList'
import { useWeb3ReactCore } from './useWeb3ReactCore'

const switchNetwork = async (connector: Connector, chainId: ChainId) => {
  if (!isChainSupportedByConnector(connector, chainId))
    throw new Error(`Chain ${chainId} not supported for connector (${typeof connector})`)

  if (connector === walletConnectConnection.connector || connector === networkConnection.connector) {
    await connector.activate(chainId)
    return
  }

  const { chainName, rpcUrls, nativeCurrency, blockExplorerUrls } = getNetworkInfo(chainId)
  const addChainParameter = {
    chainId,
    chainName,
    rpcUrls,
    nativeCurrency,
    blockExplorerUrls,
  }
  await connector.activate(addChainParameter)
}

export const useNetworkSwitch = () => {
  const { connector } = useWeb3ReactCore()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectNetwork = useCallback(
    async (chainId: ChainId) => {
      try {
        unavailableRedirect(chainId, navigate, pathname)
        await switchNetwork(connector, chainId)
        dispatch(setConnectorError({ connector: getConnection(connector).type, connectorError: undefined }))
      } catch (error) {
        console.error('Failed to switch networks', error)
        dispatch(
          setConnectorError({ connector: getConnection(connector).type, connectorError: getErrorMessage(error) })
        )
      }
    },
    [connector, dispatch, navigate, pathname]
  )

  return {
    selectNetwork,
  }
}

/**
 * Checks if the conditions for the pools and rewards are available and, if not, redirects to '/swap', the default page
 * @param optionChainId chainId to which we are changing
 * @param navigate react method for changing the location
 * @param pathname current page pathname
 */
export function unavailableRedirect(optionChainId: ChainId, navigate: NavigateFunction, pathname: string) {
  if (
    !SWPR[optionChainId] &&
    // check if the URL includes any of these
    ['/pools', '/rewards'].reduce((state, str) => state || pathname.includes(str), false)
  )
    navigate('/swap')
}
