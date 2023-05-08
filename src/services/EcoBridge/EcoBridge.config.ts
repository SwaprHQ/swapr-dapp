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
const lifiBridgeId = 'lifi'

export const BRIDGES_URLS = {
  ARBITRUM: 'https://bridge.arbitrum.io/',
  CONNEXT: 'https://bridge.connext.network/',
  LIFI: 'https://li.fi/',
  OMNIBRIDGE: 'https://omnibridge.gnosischain.com/',
  SOCKET: 'https://socket.tech/',
  XDAI: 'https://bridge.gnosischain.com/',
}

//supported chains are bidirectional
export const ecoBridgeConfig: EcoBridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: 'arbitrum:testnet',
    displayName: 'Arbitrum Test',
    displayUrl: BRIDGES_URLS.ARBITRUM,
    supportedChains: [{ from: ChainId.GOERLI, to: ChainId.ARBITRUM_GOERLI }],
  }),
  new ArbitrumBridge({
    bridgeId: 'arbitrum:mainnet',
    displayName: 'Arbitrum',
    displayUrl: BRIDGES_URLS.ARBITRUM,
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }],
  }),
  new SocketBridge({
    bridgeId: socketBridgeId,
    displayName: 'Socket',
    displayUrl: BRIDGES_URLS.SOCKET,
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
    displayUrl: BRIDGES_URLS.XDAI,
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.XDAI }],
  }),
  new Connext({
    bridgeId: 'connext',
    displayName: 'Connext',
    displayUrl: BRIDGES_URLS.CONNEXT,
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
    displayUrl: BRIDGES_URLS.OMNIBRIDGE,
    supportedChains: [{ from: ChainId.XDAI, to: ChainId.MAINNET }],
  }),
  new LifiBridge({
    bridgeId: lifiBridgeId,
    displayName: 'Lifi',
    displayUrl: BRIDGES_URLS.LIFI,
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
  const keysWithoutSocketOrLifi = ecoBridgePersistedKeys.filter(
    key => !(key.includes(socketBridgeId) || key.includes(lifiBridgeId))
  )

  keysWithoutSocketOrLifi.forEach(key => {
    const fullKey = `${persistenceNamespace}_${key}`

    const isEntityAdapter = window.localStorage.getItem(fullKey)?.includes('entities')

    if (!isEntityAdapter) {
      console.warn(`${fullKey} uses legacy store interface. It was cleared to preserve compatibility.`)
      window.localStorage.removeItem(fullKey)
    }
  })
}
