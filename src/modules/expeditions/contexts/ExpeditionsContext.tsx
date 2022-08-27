import type { Web3Provider } from '@ethersproject/providers'

import { createContext } from 'react'

import { WeeklyFragmentRewards } from '../api'

export interface ExpeditionsContext {
  userAddress: string
  isLoading: boolean
  provider: Web3Provider
  rewards: {
    liquidityProvision: WeeklyFragmentRewards
    liquidityStaking: WeeklyFragmentRewards
  }
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ExpeditionsContext = createContext({} as ExpeditionsContext)
