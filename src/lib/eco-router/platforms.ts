import { ChainId, RoutablePlatform, UniswapV2RoutablePlatform } from '@swapr/sdk'

const uniswapV2Platforms = [
  UniswapV2RoutablePlatform.SWAPR,
  UniswapV2RoutablePlatform.SUSHISWAP,
  UniswapV2RoutablePlatform.HONEYSWAP,
  UniswapV2RoutablePlatform.LEVINSWAP,
  UniswapV2RoutablePlatform.DFYN,
  UniswapV2RoutablePlatform.QUICKSWAP,
  UniswapV2RoutablePlatform.PANCAKESWAP,
]
const allPlatforms = [
  RoutablePlatform.CURVE,
  RoutablePlatform.ZEROX,
  RoutablePlatform.UNISWAP,
  RoutablePlatform.COW,
  RoutablePlatform.ONE_INCH,
  UniswapV2RoutablePlatform.SWAPR,
  UniswapV2RoutablePlatform.SUSHISWAP,
  UniswapV2RoutablePlatform.HONEYSWAP,
  UniswapV2RoutablePlatform.LEVINSWAP,
  UniswapV2RoutablePlatform.DFYN,
  UniswapV2RoutablePlatform.QUICKSWAP,
  UniswapV2RoutablePlatform.PANCAKESWAP,
]

/**
 * List of Uniswap V2 platform that support current chain
 */
export function getUniswapV2PlatformList(chainId: ChainId) {
  return uniswapV2Platforms.filter(platform => platform.supportsChain(chainId))
}

// getSupportedPlatformsByChainId returns the platforms that support a given chain ID.
// The platforms returned are the ones that are supported by the current version of the SDK.
export function getSupportedPlatformsByChainId(chainId: ChainId) {
  return allPlatforms.filter(platform => platform.supportsChain(chainId))
}
