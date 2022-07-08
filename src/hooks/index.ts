import { Web3Provider } from '@ethersproject/providers'
import { ChainId } from '@swapr/sdk'

import { CoinbaseWallet } from '@web3-react/coinbase-wallet'
import { useWeb3React } from '@web3-react/core'
import { MetaMask } from '@web3-react/metamask'
import { Network } from '@web3-react/network'
import { Connector } from '@web3-react/types'
import { WalletConnect } from '@web3-react/walletconnect'
import { network } from 'connectors/network'
import { useEffect, useState } from 'react'
import { isMobile } from 'react-device-detect'

export function useEagerConnect() {
  const { isActive } = useWeb3React() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void network.activate().catch(() => {
      console.debug('Failed to connect to network')
    })
  }, [])

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
// export function useInactiveListener(suppress = false) {
//   const { active, error, activate } = useWeb3ReactCore() // specifically using useWeb3React because of what this hook does

//   useEffect(() => {
//     const { ethereum } = window

//     if (ethereum && ethereum.on && !active && !error && !suppress) {
//       const handleChainChanged = () => {
//         // eat errors
//         activate(injected, undefined, true).catch(error => {
//           console.error('Failed to activate after chain changed', error)
//         })
//       }

//       const handleAccountsChanged = (accounts: string[]) => {
//         if (accounts.length > 0) {
//           // eat errors
//           activate(injected, undefined, true).catch(error => {
//             console.error('Failed to activate after accounts changed', error)
//           })
//         }
//       }

//       ethereum.on('chainChanged', handleChainChanged)
//       ethereum.on('accountsChanged', handleAccountsChanged)

//       return () => {
//         if (ethereum.removeListener) {
//           ethereum.removeListener('chainChanged', handleChainChanged)
//           ethereum.removeListener('accountsChanged', handleAccountsChanged)
//         }
//       }
//     }
//     return undefined
//   }, [active, error, suppress, activate])
// }

// TODO unsupported chain id error
// export function useUnsupportedChainIdError(): boolean {
//   const { error } = useWeb3ReactCore()
//   return error instanceof UnsupportedChainIdError
// }
