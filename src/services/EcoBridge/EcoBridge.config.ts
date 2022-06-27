import { ChainId } from '@swapr/sdk'

import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { OmniBridge } from './OmniBridge/OmniBridge'
import { socketSupportedChains } from './Socket/Socket.utils'
import { SocketBridge } from './Socket/SocketBridge'
import { XdaiBridge } from './Xdai/XdaiBridge'

const socketBridgeId = 'socket'

//supported chains are bidirectional
export const ecoBridgeConfig: EcoBridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: 'arbitrum:testnet',
    displayName: 'Arbitrum',
    supportedChains: [{ from: ChainId.RINKEBY, to: ChainId.ARBITRUM_RINKEBY }],
  }),
  new ArbitrumBridge({
    bridgeId: 'arbitrum:mainnet',
    displayName: 'Arbitrum',
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }],
  }),
  new SocketBridge({
    bridgeId: 'socket',
    displayName: 'Socket',
    supportedChains: socketSupportedChains([ChainId.ARBITRUM_ONE, ChainId.MAINNET, ChainId.POLYGON, ChainId.XDAI]),
  }),
  new XdaiBridge({
    bridgeId: 'xdai',
    displayName: 'xDai Bridge',
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.XDAI }],
  }),
  new OmniBridge({
    bridgeId: 'omnibridge:eth-xdai',
    displayName: 'OmniBridge',
    supportedChains: [{ from: ChainId.XDAI, to: ChainId.MAINNET }],
  }),
]

export const ecoBridgePersistedKeys = ecoBridgeConfig.map(
  bridgeConfig => `ecoBridge.${bridgeConfig.bridgeId}.transactions`
)

export const fixCorruptedEcoBridgeLocalStorageEntries = (persistenceNamespace: string) => {
  const isEntityAdapter = /^{"ids":\[/g

  const keysWithoutSocket = ecoBridgePersistedKeys.filter(key => !key.includes(socketBridgeId))

  keysWithoutSocket.forEach(key => {
    const fullKey = `${persistenceNamespace}_${key}`
    const entry = window.localStorage.getItem(fullKey)

    if (entry && !isEntityAdapter.test(entry)) {
      console.warn(`${fullKey} uses legacy store interface. It was cleared to preserve compatibility.`)
      window.localStorage.removeItem(fullKey)
    }
  })
}
