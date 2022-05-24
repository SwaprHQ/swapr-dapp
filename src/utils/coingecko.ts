import { ChainId } from '@swapr/sdk'

interface PriceInformation {
  token: string
  amount: string | null
}

// Defaults
const API_NAME = 'Coingecko'
const API_BASE_URL = 'https://api.coingecko.com/api'
const API_VERSION = 'v3'
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function _getApiBaseUrl(chainId: ChainId): string {
  const baseUrl = API_BASE_URL

  if (!baseUrl) {
    throw new Error(`Unsupported Network. The ${API_NAME} API is not deployed in the Network ${chainId}`)
  } else {
    return baseUrl + '/' + API_VERSION
  }
}

const COINGECKO_ASSET_PLATFORM: { [chainId in ChainId]: string | null } = {
  [ChainId.MAINNET]: 'ethereum',
  [ChainId.RINKEBY]: null,
  [ChainId.ARBITRUM_ONE]: 'arbitrum-one',
  [ChainId.ARBITRUM_RINKEBY]: null,
  [ChainId.XDAI]: 'xdai',
  [ChainId.POLYGON]: 'polygon-pos',
}

function _fetch(chainId: ChainId, url: string, method: 'GET' | 'POST' | 'DELETE', data?: any): Promise<Response> {
  const baseUrl = _getApiBaseUrl(chainId)
  return fetch(baseUrl + url, {
    headers: DEFAULT_HEADERS,
    method,
    body: data !== undefined ? JSON.stringify(data) : data,
  })
}

function _get(chainId: ChainId, url: string): Promise<Response> {
  return _fetch(chainId, url, 'GET')
}

export interface CoinGeckoUsdPriceParams {
  chainId: ChainId
  tokenAddress: string
}

interface CoinGeckoUsdQuote {
  [address: string]: {
    usd: number
  }
}

export async function getUSDPriceQuote(params: CoinGeckoUsdPriceParams): Promise<CoinGeckoUsdQuote | null> {
  const { chainId, tokenAddress } = params

  const assetPlatform = COINGECKO_ASSET_PLATFORM[chainId]
  if (assetPlatform == null) {
    // Unsupported
    return null
  }

  const response = await _get(
    chainId,
    `/simple/token_price/${assetPlatform}?contract_addresses=${tokenAddress}&vs_currencies=usd`
  ).catch(error => {
    console.error(`Error getting ${API_NAME} USD price quote:`, error)
    throw new Error(error)
  })

  return response.json()
}

export function toPriceInformation(priceRaw: CoinGeckoUsdQuote | null): PriceInformation | null {
  // We only receive/want the first key/value pair in the return object
  const token = priceRaw ? Object.keys(priceRaw)[0] : null

  if (!token || !priceRaw?.[token].usd) {
    return null
  }

  const { usd } = priceRaw[token]
  return { amount: usd.toString(), token }
}
