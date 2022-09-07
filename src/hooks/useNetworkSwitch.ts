import { ChainId, SWPR } from '@swapr/sdk'

import { InjectedConnector } from '@web3-react/injected-connector'
import { useCallback } from 'react'

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

  const selectNetwork = useCallback(
    (optionChainId?: ChainId) => {
      if (optionChainId === undefined || (optionChainId === chainId && !unsupportedChainIdError)) return
      let changeChainId = new Promise(() => {})
      if (!account && !unsupportedChainIdError && connector instanceof CustomNetworkConnector)
        changeChainId = connector.changeChainId(optionChainId)
      else if (!account && unsupportedChainIdError && connector instanceof CustomNetworkConnector)
        changeChainId = connector.switchUnsupportedNetwork(NETWORK_DETAIL[optionChainId])
      else if (connector instanceof InjectedConnector)
        changeChainId = switchOrAddNetwork(NETWORK_DETAIL[optionChainId], account || undefined)
      else if (connector instanceof CustomWalletLinkConnector)
        changeChainId = connector.changeChainId(NETWORK_DETAIL[optionChainId], account || undefined)

      if (onSelectNetworkCallback) onSelectNetworkCallback()
      changeChainId.then(() => {
        if (
          !SWPR[optionChainId] &&
          // check if the URL includes any of these
          ['/pools', '/rewards'].reduce((state, str) => state || window.location.href.includes(str), false)
        )
          window.location.replace('../swap')
      })
    },
    [account, chainId, connector, onSelectNetworkCallback, unsupportedChainIdError]
  )

  return {
    selectNetwork,
  }
}
