import { ChainId } from '@swapr/sdk'

import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { Connext } from './Connext/Connext'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { LifiBridge } from './Lifi/LifiBridge'
import { OmniBridge } from './OmniBridge/OmniBridge'
import { bridgeSupportedChains } from './Socket/Socket.utils'
import { SocketBridge } from './Socket/SocketBridge'
import { XdaiBridge } from './Xdai/XdaiBridge'

const socketBridgeId = 'socket'

//supported chains are bidirectional
export const ecoBridgeConfig: EcoBridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: 'arbitrum:testnet',
    displayName: 'Arbitrum Test',
    supportedChains: [{ from: ChainId.GOERLI, to: ChainId.ARBITRUM_GOERLI }],
  }),
  new ArbitrumBridge({
    bridgeId: 'arbitrum:mainnet',
    displayName: 'Arbitrum',
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }],
  }),
  new SocketBridge({
    bridgeId: 'socket',
    displayName: 'Socket',
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.XDAI,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
  new XdaiBridge({
    bridgeId: 'xdai',
    displayName: 'xDai Bridge',
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.XDAI }],
  }),
  new Connext({
    bridgeId: 'connext',
    displayName: 'Connext',
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.XDAI,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
  new OmniBridge({
    bridgeId: 'omnibridge:eth-xdai',
    displayName: 'OmniBridge',
    supportedChains: [{ from: ChainId.XDAI, to: ChainId.MAINNET }],
  }),
  new LifiBridge({
    bridgeId: 'lifi',
    displayName: 'Lifi',
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.GNOSIS,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
]

export const ecoBridgePersistedKeys = ecoBridgeConfig.map(
  bridgeConfig => `ecoBridge.${bridgeConfig.bridgeId}.transactions`
)

export const fixCorruptedEcoBridgeLocalStorageEntries = (persistenceNamespace: string) => {
  const keysWithoutSocket = ecoBridgePersistedKeys.filter(key => !key.includes(socketBridgeId))

  keysWithoutSocket.forEach(key => {
    const fullKey = `${persistenceNamespace}_${key}`

    const isEntityAdapter = window.localStorage.getItem(fullKey)?.includes('entities')

    if (!isEntityAdapter) {
      console.warn(`${fullKey} uses legacy store interface. It was cleared to preserve compatibility.`)
      window.localStorage.removeItem(fullKey)
    }
  })
}
