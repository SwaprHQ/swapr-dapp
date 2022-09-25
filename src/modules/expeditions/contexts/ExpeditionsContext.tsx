import type { Web3Provider } from '@ethersproject/providers'

import { createContext, useContext } from 'react'

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

export const useExpeditions = () => {
  const expeditions = useContext(ExpeditionsContext)
  if (!expeditions) {
    throw new Error('This hook must be used in context of Expeditions provider')
  }

  return expeditions
}
