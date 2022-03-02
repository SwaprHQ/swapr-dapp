import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { ChainId } from '@swapr/sdk'
import { OmnibridgeChildBase } from './Omnibridge.utils'
import { SocketBridge } from './Socket/SocketBridge'

//supported chains are bidirectional
export const omnibridgeConfig: OmnibridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: 'arbitrum:testnet',
    displayName: 'Arbitrum testnet',
    supportedChains: [{ from: ChainId.RINKEBY, to: ChainId.ARBITRUM_RINKEBY }]
  }),
  new ArbitrumBridge({
    bridgeId: 'arbitrum:mainnet',
    displayName: 'Arbitrum mainnet',
    supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }]
  }),
  new SocketBridge({
    bridgeId: 'socket',
    displayName: 'Socket',
    supportedChains: [
      { from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE },
      { from: ChainId.MAINNET, to: ChainId.XDAI },
      { from: ChainId.XDAI, to: ChainId.ARBITRUM_ONE }
    ]
  })
]

export const omnibridgePersistedKeys = omnibridgeConfig.map(
  bridgeConfig => `omnibridge.${bridgeConfig.bridgeId}.transactions`
)
