import { RoutablePlatform } from '@swapr/sdk'

import { createContext, Dispatch, SetStateAction } from 'react'

import { UseDerivedSwapInfoResult } from '../../state/swap/hooks'

export type PlatformOverride = RoutablePlatform | null

export interface ISwapContext extends UseDerivedSwapInfoResult {
  platformOverride: PlatformOverride
  setPlatformOverride: Dispatch<SetStateAction<PlatformOverride>>
}

export const SwapContext = createContext<ISwapContext>({} as ISwapContext)
