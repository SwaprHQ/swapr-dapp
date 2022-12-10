import type { Web3Provider } from '@ethersproject/providers'

import { useEffect, useState } from 'react'

import { HeaderButton } from '../../../components/Header/HeaderButton'
import { useShowExpeditionsPopup, useToggleShowExpeditionsPopup } from '../../../state/application/hooks'
import { ExpeditionsAPI } from '../api'
import { ExpeditionsModal } from '../components/ExpeditionsModal'
import { ExpeditionsContext } from '../contexts/ExpeditionsContext'

export interface SwaprExpeditionsAppProps {
  provider: Web3Provider
  account: string
}

export function App({ provider, account }: SwaprExpeditionsAppProps) {
  const isOpen = useShowExpeditionsPopup()
  const toggleExpeditionsPopup = useToggleShowExpeditionsPopup()

  if (!account) {
    throw new Error('SwaprExpeditionsApp: No account')
  }

  if (!provider) {
    throw new Error('SwaprExpeditionsApp: No provider')
  }
  // Controls fetching of data from the backend
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<ExpeditionsContext['tasks']>()
  const [claimedFragments, setClaimedFragments] = useState<ExpeditionsContext['claimedFragments']>(0)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    const getDailyProgress = async () => {
      if (isOpen) {
        setError(undefined)
        setIsLoading(true)
        try {
          const { claimedFragments, tasks } = await ExpeditionsAPI.getExpeditionsProgress({ address: account })
          setTasks(tasks)
          setClaimedFragments(claimedFragments)
        } catch (error) {
          setError('No active campaign has been found')
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    getDailyProgress()
  }, [account, isOpen])

  return (
    <ExpeditionsContext.Provider
      value={
        {
          provider,
          userAddress: account,
          isLoading,
          claimedFragments,
          setClaimedFragments,
          setTasks,
          tasks,
          error,
        } as ExpeditionsContext
      }
    >
      <HeaderButton onClick={toggleExpeditionsPopup} style={{ marginRight: '7px' }}>
        &#10024;&nbsp;Expeditions
      </HeaderButton>
      <ExpeditionsModal onDismiss={toggleExpeditionsPopup} />
    </ExpeditionsContext.Provider>
  )
}
