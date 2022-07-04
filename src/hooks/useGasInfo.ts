import { ChainId } from '@swapr/sdk'

import { useEffect, useState } from 'react'

import { INFURA_PROJECT_ID } from '../connectors'

import { useActiveWeb3React } from './index'

interface ChainGasInfo {
  [chainId: number]: {
    url: string
    requestConfig?: RequestInit
    keys?: string[]
  }
}

const gasInfoChainUrls: ChainGasInfo = {
  [ChainId.MAINNET]: {
    //without apiKey will work in rate limit manner
    url: `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${
      process.env.REACT_APP_ETHERSCAN_API_KEY ?? ''
    }`,
    keys: ['ProposeGasPrice', 'FastGasPrice', 'SafeGasPrice'],
  },
  [ChainId.XDAI]: {
    url: 'https://blockscout.com/xdai/mainnet/api/v1/gas-price-oracle',
    keys: ['average', 'fast', 'slow'],
  },
  [ChainId.POLYGON]: {
    //apiKey is `key` 😁
    url: 'https://gpoly.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle',
    keys: ['ProposeGasPrice', 'FastGasPrice', 'SafeGasPrice'],
  },
  [ChainId.ARBITRUM_ONE]: {
    url: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
    requestConfig: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1,
      }),
    },
  },
}

interface Gas {
  fast: number
  normal: number
  slow: number
}

const defaultGasState: Gas = {
  fast: 0,
  normal: 0,
  slow: 0,
}

/**
 * Fetches and return gas price information for the current active chain
 * @returns Gas prices
 */
export function useGasInfo(): { loading: boolean; gas: Gas } {
  const { chainId } = useActiveWeb3React()
  const [loading, setLoading] = useState<boolean>(true)
  const [gas, setGas] = useState<Gas>(defaultGasState)

  useEffect(() => {
    if (!chainId || !gasInfoChainUrls[chainId]) {
      setLoading(false)
      setGas(defaultGasState)
      return
    }

    // Fetch gas price data
    const chainGasInfo = gasInfoChainUrls[chainId]

    fetch(chainGasInfo.url, chainGasInfo.requestConfig)
      .then(res => res.json())
      .then(data => {
        // Default gas prices
        let { normal, slow, fast } = defaultGasState

        // Mainnet and xDAI uses external API
        if (chainId === ChainId.MAINNET || chainId === ChainId.POLYGON) {
          const keys = chainGasInfo.keys ?? []
          // Pick the keys
          normal = data.result[keys[0]]
          fast = data.result[keys[1]]
          slow = data.result[keys[2]]
          // ethgas.watch returns both USD and Gwei units
        } else if (chainId === ChainId.XDAI) {
          const keys = chainGasInfo.keys ?? []
          normal = data[keys[0]]
          fast = data[keys[1]]
          slow = data[keys[2]]
        } else {
          // On Arbitrum (and other L2's), parse Gwei to decimal and round the number
          // There is no fast nor slow gas prices
          normal = parseFloat((parseInt(data.result, 16) / 1e9).toFixed(2))
        }
        // Update state
        setGas({ normal, fast, slow })
      })
      .catch(e => {
        console.error('useGasInfo error: ', e)
        setGas(defaultGasState)
      })
      .finally(() => setLoading(false))
  }, [chainId])

  return {
    loading,
    gas,
  }
}
