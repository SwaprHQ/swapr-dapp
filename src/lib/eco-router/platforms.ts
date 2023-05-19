import { ChainId, RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

/**
 * List of Uniswap V2 platform that support current chain
 */
export function getUniswapV2PlatformList(chainId: ChainId): UniswapV2RoutablePlatform[] {
  return [
    UniswapV2RoutablePlatform.BISWAP,
    UniswapV2RoutablePlatform.DFYN,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
    UniswapV2RoutablePlatform.PANCAKESWAP,
    UniswapV2RoutablePlatform.QUICKSWAP,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.SWAPR,
  ].filter(platform => platform.supportsChain(chainId))
}

/**
 * List of supported platforms by chainId
 * @param chainId ChainId
 * @returns
 */
export function getSupportedPlatformsByChainId(chainId: ChainId) {
  return [
    RoutablePlatform.ZEROX,
    RoutablePlatform.ONE_INCH,
    UniswapV2RoutablePlatform.BISWAP,
    RoutablePlatform.COW,
    RoutablePlatform.CURVE,
    UniswapV2RoutablePlatform.DFYN,
    UniswapV2RoutablePlatform.HONEYSWAP,
    UniswapV2RoutablePlatform.LEVINSWAP,
    UniswapV2RoutablePlatform.PANCAKESWAP,
    UniswapV2RoutablePlatform.QUICKSWAP,
    UniswapV2RoutablePlatform.SUSHISWAP,
    UniswapV2RoutablePlatform.SWAPR,
    RoutablePlatform.UNISWAP,
    RoutablePlatform.VELODROME,
  ].filter(platform => platform.supportsChain(chainId))
}
