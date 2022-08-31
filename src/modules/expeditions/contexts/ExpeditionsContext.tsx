import type { Web3Provider } from '@ethersproject/providers'

import { createContext } from 'react'

import { WeeklyFragmentsRewards } from '../api/generated'

export interface ExpeditionsContext {
  userAddress: string
  isLoading: boolean
  provider: Web3Provider
  rewards: {
    liquidityProvision: WeeklyFragmentsRewards
    liquidityStaking: WeeklyFragmentsRewards
  }
  setRewards: (reward: ExpeditionsContext['rewards']) => void
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const ExpeditionsContext = createContext({} as ExpeditionsContext)
