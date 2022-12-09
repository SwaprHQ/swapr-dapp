import { CurrencyAmount } from '@swapr/sdk'

import { Zap } from '../../hooks/zap/Zap'

export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export interface ZapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }
  readonly pairTokens: {
    token0Id: string | undefined
    token1Id: string | undefined
  }
  // the typed recipient address or ENS name, or null if zap should go to sender
  readonly recipient: string | null
  readonly protocolFeeTo: string | undefined
}

export type ZapInType = Parameters<Zap['functions']['zapIn']>
export type ZapOutType = Parameters<Zap['functions']['zapOut']>
export type ZapInTx = ZapInType[0]
export type ZapOutTx = ZapOutType[0]
export type SwapTx = ZapInType[1]

export interface ZapContractParams {
  zapIn?: ZapInTx
  zapOut?: ZapOutTx
  swapTokenA: SwapTx
  swapTokenB: SwapTx
  recipient: string | null
  affiliate?: string
  transferResidual?: boolean
}

export interface UseZapCallbackParams {
  zapContractParams: ZapContractParams
  parsedAmounts: { [Field.INPUT]: CurrencyAmount | undefined; [Field.OUTPUT]: CurrencyAmount | undefined }
}
