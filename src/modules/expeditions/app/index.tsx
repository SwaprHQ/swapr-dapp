import type { Web3Provider } from '@ethersproject/providers'

import { useEffect, useState } from 'react'

import { HeaderButton } from '../../../components/Header/HeaderButton'
import { useToggleShowExpeditionsPopup } from '../../../state/application/hooks'
import { getUserExpeditionsRewards } from '../api'
import { ExpeditionsModal } from '../components/ExpeditionsModal'
import { ExpeditionsContext } from '../contexts/ExpeditionsContext'

export interface SwaprExpeditionsAppProps {
  provider: Web3Provider
  account: string
}

export function App({ provider, account }: SwaprExpeditionsAppProps) {
  const toggleExpeditionsPopup = useToggleShowExpeditionsPopup()

  if (!account) {
    throw new Error('SwaprExpeditionsApp: No account')
  }

  if (!provider) {
    throw new Error('SwaprExpeditionsApp: No provider')
  }
  // Controls fetching of data from the backend
  const [isLoading, setIsLoading] = useState(true)
  const [rewards, setRewards] = useState<ExpeditionsContext['rewards']>()

  useEffect(() => {
    getUserExpeditionsRewards(account as string)
      .then(userRewards => {
        setRewards(userRewards.data)
      })
      .catch(error => {
        console.error(error)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [account])

  if (isLoading) {
    return null
  }

  return (
    <ExpeditionsContext.Provider
      value={
        {
          provider,
          userAddress: account,
          isLoading,
          rewards,
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
