import React, { useContext, useEffect, useState, FC } from 'react'
import { EcoBridge } from './EcoBridge'
import store from '../../state'
import { useActiveWeb3React } from '../../hooks'
import { ecoBridgeConfig } from './EcoBridge.config'

export const EcoBridgeContext = React.createContext<EcoBridge | null>(null)

export const EcoBridgeProvider: FC = ({ children }) => {
  const { library, account, chainId } = useActiveWeb3React()
  const [ecoBridge, setEcoBridge] = useState<EcoBridge | null>(null)

  useEffect(() => {
    const initEcoBridge = async () => {
      if (!ecoBridge) {
        const ecoBridgeInstance = new EcoBridge(store, ecoBridgeConfig)
        setEcoBridge(ecoBridgeInstance)
      }

      if (ecoBridge && account && library && chainId) {
        if (!ecoBridge.ready) {
          await ecoBridge.init({ account, activeChainId: chainId, activeProvider: library })
        } else {
          await ecoBridge.updateSigner({ account, activeChainId: chainId, activeProvider: library })
        }
      }
    }
    initEcoBridge()
  }, [account, chainId, library, ecoBridge])

  return <EcoBridgeContext.Provider value={ecoBridge}>{children}</EcoBridgeContext.Provider>
}

export const useEcoBridge = () => {
  const ecoBridge = useContext(EcoBridgeContext)
  if (!ecoBridge) {
    throw new Error('This hook must be used in context of EcoBridge provider')
  }

  return ecoBridge
}
