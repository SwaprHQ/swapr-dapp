import { ChainId } from '@swapr/sdk'

interface EcoBridgePlatformInformation {
  platformName: string
  supportedChains: {
    to: ChainId
    from: ChainId
  }[]
}

export const bridgeSupportedChains = (supportedChains: ChainId[]) =>
  supportedChains
    .flatMap((v, i) => supportedChains.slice(i + 1).map(w => [v, w]))
    .map<any>(([from, to]) => ({
      from,
      to,
    }))

export function ecoBridgePlatformList(): EcoBridgePlatformInformation[] {
  return [
    {
      platformName: 'arbitrum-testnet',
      supportedChains: [{ from: ChainId.RINKEBY, to: ChainId.ARBITRUM_RINKEBY }],
    },
    {
      platformName: 'arbitrum-mainnet',
      supportedChains: [{ from: ChainId.MAINNET, to: ChainId.ARBITRUM_ONE }],
    },
    {
      platformName: 'socket',
      supportedChains: bridgeSupportedChains([
        ChainId.ARBITRUM_ONE,
        ChainId.MAINNET,
        ChainId.POLYGON,
        ChainId.GNOSIS,
        ChainId.OPTIMISM_MAINNET,
        ChainId.BSC_MAINNET,
      ]),
    },
    {
      platformName: 'xdai',
      supportedChains: [{ from: ChainId.MAINNET, to: ChainId.XDAI }],
    },
    {
      platformName: 'connext',
      supportedChains: bridgeSupportedChains([
        ChainId.ARBITRUM_ONE,
        ChainId.MAINNET,
        ChainId.POLYGON,
        ChainId.GNOSIS,
        ChainId.OPTIMISM_MAINNET,
        ChainId.BSC_MAINNET,
      ]),
    },
  ]
}
