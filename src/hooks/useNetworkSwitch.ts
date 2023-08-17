import { ChainId, SWPR } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect-v2'
import { useCallback } from 'react'
import { NavigateFunction, useLocation, useNavigate } from 'react-router-dom'

import { useActiveWeb3React, useUnsupportedChainIdError } from '.'

export type UseNetworkSwitchProps = {
  onSelectNetworkCallback?: () => void
}

export const useNetworkSwitch = ({ onSelectNetworkCallback }: UseNetworkSwitchProps = {}) => {
  const { chainId, account, hooks } = useActiveWeb3React()
  const { usePriorityConnector } = hooks
  const unsupportedChainIdError = useUnsupportedChainIdError()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const priorityConnector = usePriorityConnector()

  const selectNetwork = useCallback(
    async (optionChainId?: ChainId) => {
      if (optionChainId === undefined || (optionChainId === chainId && !unsupportedChainIdError)) return

      let changeChainIdResult: unknown
      if (!account && !unsupportedChainIdError && priorityConnector instanceof Network) {
        priorityConnector.activate(optionChainId)
        unavailableRedirect(optionChainId, navigate, pathname)
      } else if (!account && unsupportedChainIdError && priorityConnector instanceof Network)
        changeChainIdResult = await priorityConnector.activate(optionChainId)
      else if (priorityConnector instanceof MetaMask)
        changeChainIdResult = await priorityConnector.activate(optionChainId)
      else if (priorityConnector instanceof CoinbaseWallet)
        changeChainIdResult = await priorityConnector.activate(optionChainId)
      else if (priorityConnector instanceof WalletConnect) {
        priorityConnector.activate(optionChainId)
        unavailableRedirect(optionChainId, navigate, pathname)
      }

      if (onSelectNetworkCallback) onSelectNetworkCallback()
      // success scenario - user accepts the change on the popup window
      if (changeChainIdResult === null) unavailableRedirect(optionChainId, navigate, pathname)
    },
    [account, chainId, navigate, onSelectNetworkCallback, pathname, priorityConnector, unsupportedChainIdError]
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
