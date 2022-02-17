export interface ArbitrumTokenList {
  id: number
  chainId: string
  url: string
  name: string
  isDefault: boolean
  logoURI: string
}

export const ARBITRUM_TOKEN_LISTS: ArbitrumTokenList[] = [
  {
    id: 1,
    chainId: '42161',
    url: 'https://bridge.arbitrum.io/token-list-42161.json',
    name: 'Arbitrum Whitelist Era',
    isDefault: true,
    logoURI: 'https://ipfs.io/ipfs/QmTvWJ4kmzq9koK74WJQ594ov8Es1HHurHZmMmhU8VY68y'
  },
  {
    id: 2,
    chainId: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_uniswap_labs_list.json',
    name: 'Arbed Uniswap List',
    isDefault: true,
    logoURI: 'https://ipfs.io/ipfs/QmNa8mQkrNKp1WEEeGjFezDmDeodkWRevGFN8JCV7b4Xir'
  },
  {
    id: 3,
    chainId: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_gemini_token_list.json',
    name: 'Arbed Gemini List',
    isDefault: false,
    logoURI: 'https://gemini.com/static/images/loader.png'
  },
  {
    id: 4,
    chainId: '421611',
    url: 'https://bridge.arbitrum.io/token-list-421611.json',
    name: 'Rinkarby Tokens',
    isDefault: true,
    logoURI: 'https://ipfs.io/ipfs/QmTvWJ4kmzq9koK74WJQ594ov8Es1HHurHZmMmhU8VY68y'
  },
  {
    id: 5,
    chainId: '42161',
    url: 'https://tokenlist.arbitrum.io/ArbTokenLists/arbed_coinmarketcap.json',
    name: 'Arbed CMC List',
    isDefault: false,
    logoURI: 'https://ipfs.io/ipfs/QmQAGtNJ2rSGpnP6dh6PPKNSmZL8RTZXmgFwgTdy5Nz5mx'
  }
]
