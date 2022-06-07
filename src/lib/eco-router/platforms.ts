import { ChainId, UniswapV2RoutablePlatform } from '@swapr/sdk'

/**
 * List of Uniswap V2 platform that support current chain
 */
export function getUniswapV2PlatformList(chainId: ChainId): UniswapV2RoutablePlatform[] {
  return [
    UniswapV2RoutablePlatform.SWAPR,
    UniswapV2RoutablePlatform.UNISWAP,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.BAOSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
  ].filter(platform => platform.supportsChain(chainId as ChainId))
}
