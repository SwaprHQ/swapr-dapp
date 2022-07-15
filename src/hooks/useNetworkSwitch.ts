import { ChainId } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React, Web3ReactHooks } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { WalletConnect } from '@web3-react/walletconnect'
import { getAddChainParameters, URLS } from 'connectors/chains'
import { useCallback, useState } from 'react'

import { NETWORK_DETAIL } from '../constants'
import { switchOrAddNetwork } from '../utils'

export type UseNetworkSwitchProps = {
  onSelectNetworkCallback?: () => void
}

// export const useNetworkSwitch = ({ onSelectNetworkCallback }: UseNetworkSwitchProps = {}) => {
//   const { connector, chainId, account } = useWeb3React()
//   // TODO
//   const unsupportedChainIdError = false

//   const selectNetwork = useCallback(
//     (optionChainId?: ChainId) => {
//       if (optionChainId === undefined || (optionChainId === chainId && !unsupportedChainIdError)) return
//       if (!account && !unsupportedChainIdError && connector instanceof Network) connector.changeChainId(optionChainId)
//       else if (!account && unsupportedChainIdError && connector instanceof Network)
//         connector.switchUnsupportedNetwork(NETWORK_DETAIL[optionChainId])
//       else if (connector instanceof MetaMask) switchOrAddNetwork(NETWORK_DETAIL[optionChainId], account || undefined)
//       else if (connector instanceof CoinbaseWallet)
//         connector.changeChainId(NETWORK_DETAIL[optionChainId], account || undefined)

//       if (onSelectNetworkCallback) onSelectNetworkCallback()
//     },
//     [account, chainId, connector, onSelectNetworkCallback, unsupportedChainIdError]
//   )

//   return {
//     selectNetwork,
//   }
// }

export const useNetworkSwitch = ({ onSelectNetworkCallback }: UseNetworkSwitchProps = {}) => {
  const { connector, chainId } = useWeb3React()
  const isNetwork = connector instanceof Network
  const displayDefault = !isNetwork
  const chainIds = (isNetwork ? Object.keys(URLS) : Object.keys(NETWORK_DETAIL)).map(chainId => Number(chainId))

  const [desiredChainId, setDesiredChainId] = useState<number>(isNetwork ? 1 : -1)
  // TODO pendingError from Web3Status?
  const [error, setError] = useState<boolean>()

  const selectNetwork = useCallback(
    (desiredChainId: number) => {
      setDesiredChainId(desiredChainId)
      // if we're already connected to the desired chain, return
      if (desiredChainId === chainId) {
        setError(undefined)
        return
      }

      // if they want to connect to the default chain and we're already connected, return
      if (desiredChainId === -1 && chainId !== undefined) {
        setError(undefined)
        return
      }

      //TODO if !connector?
      if (connector) {
        if (connector instanceof WalletConnect || connector instanceof Network) {
          connector
            .activate(desiredChainId === -1 ? undefined : desiredChainId)
            .then(() => setError(undefined))
            .catch(setError)
        } else if (connector instanceof MetaMask || connector instanceof CoinbaseWallet) {
          connector
            .activate(desiredChainId === -1 ? undefined : getAddChainParameters(desiredChainId))
            .then(() => setError(undefined))
            .catch(setError)
        }
      }
    },
    [connector, chainId, setError]
  )

  return {
    selectNetwork,
  }
}
