import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { ChainId } from '@swapr/sdk'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { SocketBridge } from './Socket/SocketBridge'

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
    supportedChains: [
      { from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE },
      { from: ChainId.MAINNET, to: ChainId.XDAI },
      { from: ChainId.XDAI, to: ChainId.ARBITRUM_ONE },
    ],
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
