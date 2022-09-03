import type { Web3Provider } from '@ethersproject/providers'

import { createContext } from 'react'

import { WeeklyFragments } from '../api/generated'

export interface ExpeditionsContext {
  userAddress: string
  isLoading: boolean
  provider: Web3Provider
  rewards: {
    liquidityProvision: WeeklyFragments
    liquidityStaking: WeeklyFragments
  }
  setRewards: (reward: ExpeditionsContext['rewards']) => void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ExpeditionsContext = createContext({} as ExpeditionsContext)
