import React, { useContext, useEffect, useState } from 'react'
import { Omnibridge } from './Omnibridge'
import store from '../../state'
import { useActiveWeb3React } from '../../hooks'
import { omnibridgeConfig } from './Omnibridge.config'

export const OmnibridgeContext = React.createContext<Omnibridge | null>(null)

export const OmnibridgeProvider = ({ children }: { children?: React.ReactNode }) => {
  const { library, account, chainId } = useActiveWeb3React()
  const [omnibridge, setOmnibridge] = useState<Omnibridge | null>(null)

  useEffect(() => {
    const initOmnibridge = async () => {
      if (!omnibridge) {
        const omniInstance = new Omnibridge(store, omnibridgeConfig)
        setOmnibridge(omniInstance)
      }

      if (omnibridge && account && library && chainId) {
        if (!omnibridge.ready) {
          await omnibridge.init({ account, activeChainId: chainId, activeProvider: library })
        } else {
          await omnibridge.updateSigner({ account, activeChainId: chainId, activeProvider: library })
        }
      }
    }
    initOmnibridge()
  }, [account, chainId, library, omnibridge])

  return <OmnibridgeContext.Provider value={omnibridge}>{children}</OmnibridgeContext.Provider>
}

export const useOmnibridge = () => {
  const omnibridge = useContext(OmnibridgeContext)
  if (!omnibridge) {
    throw new Error('No Omnibridge - this shouldnt happen')
  }
  return omnibridge
}
