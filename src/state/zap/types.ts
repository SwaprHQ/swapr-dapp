import { Pair } from '@swapr/sdk'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface ZapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly tokenId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly pairId: string | undefined
    readonly token0Id: string | undefined
    readonly token1Id: string | undefined
  }
  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly protocolFeeTo: string | undefined
}
