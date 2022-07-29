import { web3Network } from 'connectors'
import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import { useEffect, useState } from 'react'

export function useEagerConnect() {
  const { isActive } = useWeb3ReactCore() // specifically using useWeb3ReactCore because of what this hook does
  const [tried, setTried] = useState(false)

  // attempt to connect eagerly on mount
  useEffect(() => {
    void web3Network.activate().catch(() => {
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
