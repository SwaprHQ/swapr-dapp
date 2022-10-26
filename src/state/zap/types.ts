export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface ZapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly pairTokens: {
    token0Address: string
    token1Address: string
  }
  selectedToken: string
  pairAddress: string
  // the typed recipient address or ENS name, or null if zap should go to sender
  readonly recipient: string | null
  readonly protocolFeeTo: string | undefined
}
