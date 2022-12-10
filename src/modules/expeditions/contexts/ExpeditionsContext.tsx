import type { Web3Provider } from '@ethersproject/providers'

import { createContext, useContext } from 'react'

import { Reward, Tasks } from '../api/generated'

export interface ExpeditionsContext {
  userAddress: string
  isLoading: boolean
  error: string
  setError: (error: string) => void
  provider: Web3Provider
  tasks: Tasks
  rewards: Reward[]
  claimedFragments: number
  setTasks: (tasks: ExpeditionsContext['tasks']) => void
  setClaimedFragments: (claimedFragments: ExpeditionsContext['claimedFragments']) => void
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
