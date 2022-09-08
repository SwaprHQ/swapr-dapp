import { ChainId, SWPR } from '@swapr/sdk'

import { InjectedConnector } from '@web3-react/injected-connector'
import { useCallback } from 'react'
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom'

import { CustomNetworkConnector } from '../connectors/CustomNetworkConnector'
import { CustomWalletLinkConnector } from '../connectors/CustomWalletLinkConnector'
import { NETWORK_DETAIL } from '../constants'
import { switchOrAddNetwork } from '../utils'

import { useActiveWeb3React, useUnsupportedChainIdError } from '.'

export type UseNetworkSwitchProps = {
  onSelectNetworkCallback?: () => void
}

export const useNetworkSwitch = ({ onSelectNetworkCallback }: UseNetworkSwitchProps = {}) => {
  const { connector, chainId, account } = useActiveWeb3React()
  const unsupportedChainIdError = useUnsupportedChainIdError()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const selectNetwork = useCallback(
    async (optionChainId?: ChainId) => {
      if (optionChainId === undefined || (optionChainId === chainId && !unsupportedChainIdError)) return

      let changeChainIdResult: unknown | undefined
      if (!account && !unsupportedChainIdError && connector instanceof CustomNetworkConnector) {
        connector.changeChainId(optionChainId)
        unavailableRedirect(optionChainId, navigate, pathname)
      } else if (!account && unsupportedChainIdError && connector instanceof CustomNetworkConnector)
        changeChainIdResult = await connector.switchUnsupportedNetwork(NETWORK_DETAIL[optionChainId])
      else if (connector instanceof InjectedConnector)
        changeChainIdResult = await switchOrAddNetwork(NETWORK_DETAIL[optionChainId], account || undefined)
      else if (connector instanceof CustomWalletLinkConnector)
        changeChainIdResult = await connector.changeChainId(NETWORK_DETAIL[optionChainId], account || undefined)

      if (onSelectNetworkCallback) onSelectNetworkCallback()
      // success scenario - user accepts the change on the popup window
      if (changeChainIdResult === null) unavailableRedirect(optionChainId, navigate, pathname)
    },
    [account, chainId, connector, navigate, onSelectNetworkCallback, pathname, unsupportedChainIdError]
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
