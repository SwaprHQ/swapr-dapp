export enum Asset {
  TOKEN = 'TOKEN',
  PAIR = 'PAIR',
}

export interface ZapState {
  readonly inputAsset: Asset
  readonly typedValue: string
  readonly [Asset.TOKEN]: {
    readonly tokenId: string | undefined
  }
  readonly [Asset.PAIR]: {
    readonly token0Id: string | undefined
    readonly token1Id: string | undefined
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly protocolFeeTo: string | undefined
}
