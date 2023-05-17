import { ChainId } from '@swapr/sdk'

import { BRIDGES } from '../../constants'

import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { Connext } from './Connext/Connext'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { LifiBridge } from './Lifi/LifiBridge'
import { OmniBridge } from './OmniBridge/OmniBridge'
import { bridgeSupportedChains } from './Socket/Socket.utils'
import { SocketBridge } from './Socket/SocketBridge'
import { XdaiBridge } from './Xdai/XdaiBridge'

//supported chains are bidirectional
export const ecoBridgeConfig: EcoBridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: BRIDGES.ARBITRUM_MAINNET.id,
    displayName: BRIDGES.ARBITRUM_MAINNET.name,
    displayUrl: BRIDGES.ARBITRUM_MAINNET.url,
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }],
  }),
  new ArbitrumBridge({
    bridgeId: BRIDGES.ARBITRUM_TESTNET.id,
    displayName: BRIDGES.ARBITRUM_TESTNET.name,
    displayUrl: BRIDGES.ARBITRUM_TESTNET.url,
    supportedChains: [{ from: ChainId.GOERLI, to: ChainId.ARBITRUM_GOERLI }],
  }),
  new Connext({
    bridgeId: BRIDGES.CONNEXT.id,
    displayName: BRIDGES.CONNEXT.name,
    displayUrl: BRIDGES.CONNEXT.url,
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.XDAI,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
  new LifiBridge({
    bridgeId: BRIDGES.LIFI.id,
    displayName: BRIDGES.LIFI.name,
    displayUrl: BRIDGES.ARBITRUM_MAINNET.url,
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.GNOSIS,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
  new OmniBridge({
    bridgeId: BRIDGES.OMNIBRIDGE.id,
    displayName: BRIDGES.OMNIBRIDGE.name,
    displayUrl: BRIDGES.OMNIBRIDGE.url,
    supportedChains: [{ from: ChainId.XDAI, to: ChainId.MAINNET }],
  }),
  new SocketBridge({
    bridgeId: BRIDGES.SOCKET.id,
    displayName: BRIDGES.SOCKET.name,
    displayUrl: BRIDGES.SOCKET.url,
    supportedChains: bridgeSupportedChains([
      ChainId.ARBITRUM_ONE,
      ChainId.MAINNET,
      ChainId.POLYGON,
      ChainId.GNOSIS,
      ChainId.OPTIMISM_MAINNET,
      ChainId.BSC_MAINNET,
    ]),
  }),
  new XdaiBridge({
    bridgeId: BRIDGES.XDAI.id,
    displayName: BRIDGES.XDAI.name,
    displayUrl: BRIDGES.XDAI.url,
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.GNOSIS }],
  }),
]

export const ecoBridgePersistedKeys = ecoBridgeConfig.map(
  bridgeConfig => `ecoBridge.${bridgeConfig.bridgeId}.transactions`
)

export const fixCorruptedEcoBridgeLocalStorageEntries = (persistenceNamespace: string) => {
  const keysWithoutSocketOrLifi = ecoBridgePersistedKeys.filter(
    key => !(key.includes(BRIDGES.SOCKET.id) || key.includes(BRIDGES.LIFI.id))
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
