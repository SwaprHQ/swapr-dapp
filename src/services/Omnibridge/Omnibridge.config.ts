import { ArbitrumBridge } from './Arbitrum/ArbitrumBridge'
import { ChainId } from '@swapr/sdk'
import { OmnibridgeChildBase } from './Omnibridge.utils'

export const omnibridgeConfig: OmnibridgeChildBase[] = [
  new ArbitrumBridge({
    bridgeId: 'arbitrum:testnet',
    displayName: 'Arbitrum testnet',
    supportedChains: { from: ChainId.RINKEBY, to: ChainId.ARBITRUM_RINKEBY, reverse: true }
  }),
  new ArbitrumBridge({
    bridgeId: 'arbitrum:mainnet',
    displayName: 'Arbitrum mainnet',
    supportedChains: { from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE, reverse: true }
  })
]
