import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'
import { UnsupportedChainIdError, useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { InjectedConnector } from '@web3-react/injected-connector'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { injected } from '../connectors'
import { CustomWalletLinkConnector } from '../connectors/CustomWalletLinkConnector'
import { NetworkContextName } from '../constants'
import { AbstractConnector } from '@web3-react/abstract-connector'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
  const context = useWeb3ReactCore<Web3Provider>()
  const contextNetwork = useWeb3ReactCore<Web3Provider>(NetworkContextName)
  return context.active ? context : contextNetwork
}

// check if connector type matches to the provider type
export function isProperConnectorToProvider(connector: AbstractConnector | undefined) {
  const { ethereum } = window
  if (!ethereum?.providers || !connector) {
    return undefined
  }

  let provider = undefined
  if (connector instanceof InjectedConnector) {
    provider = ethereum.providers.find(({ isMetaMask }) => isMetaMask)
  } else if (connector instanceof CustomWalletLinkConnector) {
    provider = ethereum.providers.find(({ isCoinbaseWallet }) => isCoinbaseWallet)
  }

  return ethereum.selectedProvider === provider
}

export function useEagerConnect() {
  const { activate, active } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)
  useEffect(() => {
    injected.isAuthorized().then(isAuthorized => {
      const isProperConnector = isProperConnectorToProvider(injected)
      if (isAuthorized && isProperConnector) {
        activate(injected, undefined, true).catch(() => {
          setTried(true)
        })
      } else {
        if (isMobile && window.ethereum) {
          activate(injected, undefined, true).catch(() => {
            setTried(true)
          })
        } else {
          setTried(true)
        }
      }
    })
  }, [activate]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (active) {
      setTried(true)
    }
  }, [active])

  return tried
}

/**
 * Use for network and injected - logs user in
 * and out after checking what network theyre on
 */
export function useInactiveListener(suppress = false) {
  const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !active && !error && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        activate(injected, undefined, true).catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          activate(injected, undefined, true).catch(error => {
            console.error('Failed to activate after accounts changed', error)
          })
        }
      }

      ethereum.on('chainChanged', handleChainChanged)
      ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener('chainChanged', handleChainChanged)
          ethereum.removeListener('accountsChanged', handleAccountsChanged)
        }
      }
    }
    return undefined
  }, [active, error, suppress, activate])
}

export function useUnsupportedChainIdError(): boolean {
  const { error } = useWeb3ReactCore()
  return error instanceof UnsupportedChainIdError
}
