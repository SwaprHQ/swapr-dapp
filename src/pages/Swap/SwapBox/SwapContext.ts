import { RoutablePlatform } from '@swapr/sdk'

import { createContext, Dispatch, SetStateAction } from 'react'

import { UseDerivedSwapInfoResult } from '../../../state/swap/hooks'

export type PlataformOverride = RoutablePlatform | null

export interface ISwapContext extends UseDerivedSwapInfoResult {
  platformOverride: PlataformOverride
  setPlatformOverride: Dispatch<SetStateAction<PlataformOverride>>
}

export const SwapContext = createContext<ISwapContext>({} as ISwapContext)
