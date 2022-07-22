import { useWeb3ReactCore } from 'hooks/useWeb3ReactCore'
import React, { FC, useContext, useEffect, useState } from 'react'

import store from '../../state'
import { EcoBridge } from './EcoBridge'
import { ecoBridgeConfig } from './EcoBridge.config'

export const EcoBridgeContext = React.createContext<EcoBridge | null>(null)

export const EcoBridgeProvider: FC = ({ children }) => {
  const { provider, account, chainId } = useWeb3ReactCore()
  const [ecoBridge, setEcoBridge] = useState<EcoBridge | null>(null)

  useEffect(() => {
    const initEcoBridge = async () => {
      if (!ecoBridge) {
        const ecoBridgeInstance = new EcoBridge(store, ecoBridgeConfig)
        setEcoBridge(ecoBridgeInstance)
      }

      if (ecoBridge && account && provider && chainId) {
        if (!ecoBridge.ready) {
          await ecoBridge.init({
            account,
            activeChainId: chainId,
            activeProvider: provider,
          })
        } else {
          await ecoBridge.updateSigner({
            account,
            activeChainId: chainId,
            activeProvider: provider,
          })
        }
      }
    }
    initEcoBridge()
  }, [account, chainId, provider, ecoBridge])

  return <EcoBridgeContext.Provider value={ecoBridge}>{children}</EcoBridgeContext.Provider>
}

export const useEcoBridge = () => {
  const ecoBridge = useContext(EcoBridgeContext)
  if (!ecoBridge) {
    throw new Error('This hook must be used in context of EcoBridge provider')
  }

  return ecoBridge
}
