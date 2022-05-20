import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { ChainId } from '@swapr/sdk'
import { EcoBridgeChildBase } from './EcoBridge.utils'
import { SocketBridge } from './Socket/SocketBridge'
import { OmniBridge } from './OmniBridge/OmniBridge'

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
  new OmniBridge({
    bridgeId: 'omnibridge:eth-xdai',
    displayName: 'OmniBridge',
    supportedChains: [{ from: ChainId.XDAI, to: ChainId.MAINNET }],
  }),
]

export const ecoBridgePersistedKeys = ecoBridgeConfig.map(
  bridgeConfig => `ecoBridge.${bridgeConfig.bridgeId}.transactions`
)
