import { ChainId } from '@swapr/sdk'

import { Web3ContextType, useWeb3React as useWeb3ReactCore } from '@web3-react/core'
import { useEffect, useState } from 'react'

import { metaMask, network } from '../connectors'

export function useActiveWeb3React(): Web3ContextType & { chainId?: ChainId } {
  const context = useWeb3ReactCore()
  const {
    useSelectedChainId,
    useSelectedAccounts,
    useSelectedIsActivating,
    useSelectedAccount,
    useSelectedIsActive,
    useSelectedProvider,
    useSelectedENSNames,
    useSelectedENSName,
  } = context.hooks

  const contextNetwork = {
    chainId: useSelectedChainId(network) as ChainId,
    accounts: useSelectedAccounts(network),
    isActivating: useSelectedIsActivating(network),
    account: useSelectedAccount(network),
    isActive: useSelectedIsActive(network),
    provider: useSelectedProvider(network),
    ENSNames: useSelectedENSNames(network),
    ENSName: useSelectedENSName(network),
    connector: network,
    hooks: context.hooks,
  }

  return context.isActive && context.chainId && Boolean(ChainId[context.chainId]) ? context : contextNetwork
}

export function useEagerConnect() {
  const { isActive } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  useEffect(() => {
    if (!isActive) {
      metaMask.connectEagerly().catch(() => {
        console.error('Failed to connect eagerly to metamask')
      })
    }
    setTried(true)
  }, [isActive]) // intentionally only running on mount (make sure it's only mounted once :))

  // if the connection worked, wait until we get confirmation of that to flip the flag
  useEffect(() => {
    if (isActive) {
      setTried(true)
    }
  }, [isActive])

  return tried
}

// /**
//  * Use for network and injected - logs user in
//  * and out after checking what network theyre on
//  */
export function useInactiveListener(suppress = false) {
  const { isActive, connector } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does
  const isUnsupportedChainIdError = useUnsupportedChainIdError()

  useEffect(() => {
    const { ethereum } = window

    if (ethereum && ethereum.on && !isActive && !isUnsupportedChainIdError && !suppress) {
      const handleChainChanged = () => {
        // eat errors
        connector.activate()?.catch(error => {
          console.error('Failed to activate after chain changed', error)
        })
      }

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          // eat errors
          connector.activate()?.catch(error => {
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
  }, [suppress, isActive, isUnsupportedChainIdError, connector])
}

export function useUnsupportedChainIdError(): boolean {
  const { chainId } = useWeb3ReactCore()
  return chainId ? !ChainId[chainId] : false
}
