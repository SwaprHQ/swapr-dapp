type LifiTokenInfo = {
  address: string
  symbol: string
  decimals: number
  chainId: number
  name: string
  coinKey: string
  priceUSD: string
  logoURI: string
}

export type LifiTokenMap = {
  [key: string]: LifiTokenInfo
}
