import React, { useContext, useEffect, useState } from 'react'
import { ChainId } from '@swapr/sdk'
import { Omnibridge } from './Omnibridge'
import { BridgeList } from './Omnibridge.types'
import store from '../../state'
import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { useActiveWeb3React } from '../../hooks'

export const OmnibridgeContext = React.createContext<Omnibridge | null>(null)

export const OmnibridgeProvider = ({ children }: { children?: React.ReactNode }) => {
  const { library, account, chainId } = useActiveWeb3React()
  const [omnibridge, setOmnibridge] = useState<Omnibridge | null>(null)

  useEffect(() => {
    const initOmnibridge = async () => {
      if (!omnibridge) {
        const omniInstance = new Omnibridge(store, {
          [BridgeList.ARB_TESTNET]: new ArbitrumBridge({
            supportedChains: { from: ChainId.RINKEBY, to: ChainId.ARBITRUM_RINKEBY, reverse: true }
          }),
          [BridgeList.ARB_MAINNET]: new ArbitrumBridge({
            supportedChains: { from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE, reverse: true }
          })
        })
        setOmnibridge(omniInstance)
      }

      if (omnibridge && account && library && chainId) {
        if (!omnibridge.ready) {
          await omnibridge.init({ account, activeChainId: chainId, activeProvider: library })
        } else {
          await omnibridge.updateSigner({ account, activeChainId: chainId, activeProvider: library })
        }
        // TODO: Tmp solution, will be handled by bridge selection screen or automatically on collection
        if ([ChainId.ARBITRUM_RINKEBY, ChainId.RINKEBY].includes(chainId)) {
          omnibridge.setActiveBridge(BridgeList.ARB_TESTNET)
          return
        }

        if ([ChainId.ARBITRUM_ONE, ChainId.MAINNET].includes(chainId)) {
          omnibridge.setActiveBridge(BridgeList.ARB_MAINNET)
          return
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
