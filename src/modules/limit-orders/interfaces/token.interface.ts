export interface BaseToken {
  address: string
  decimals: number
  symbol: string
  chainId: number
  name?: string
}

export type NativeToken = BaseToken & {
  isToken: false
  isNative: true
}

export type ERC20ishToken = BaseToken & {
  isNative: false
  isToken: true
}

export interface TokenAmount<Token = ERC20ishToken> {
  token: Token
  /**
   * Amount in wei
   */
  amount: string
}
