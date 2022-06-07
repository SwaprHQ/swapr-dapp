import { ChainId } from '@swapr/sdk'
import { SocketBridge } from './Socket/SocketBridge'
import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { socketSupportedChains } from './Socket/Socket.utils'

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
