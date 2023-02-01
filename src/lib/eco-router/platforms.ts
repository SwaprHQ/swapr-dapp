import { ChainId, RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

/**
 * List of Uniswap V2 platform that support current chain
 */
export function getUniswapV2PlatformList(chainId: ChainId): UniswapV2RoutablePlatform[] {
  return [
    UniswapV2RoutablePlatform.SWAPR,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
    UniswapV2RoutablePlatform.DFYN,
    UniswapV2RoutablePlatform.QUICKSWAP,
    UniswapV2RoutablePlatform.PANCAKESWAP,
  ].filter(platform => platform.supportsChain(chainId))
}

/**
 * List of supported platforms by chainId
 * @param chainId ChainId
 * @returns
 */
export function getSupportedPlatformsByChainId(chainId: ChainId) {
  return [
    RoutablePlatform.CURVE,
    RoutablePlatform.ZEROX,
    RoutablePlatform.UNISWAP,
    RoutablePlatform.COW,
    UniswapV2RoutablePlatform.SWAPR,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
    UniswapV2RoutablePlatform.DFYN,
    UniswapV2RoutablePlatform.QUICKSWAP,
    UniswapV2RoutablePlatform.PANCAKESWAP,
  ].filter(platform => platform.supportsChain(chainId))
}
