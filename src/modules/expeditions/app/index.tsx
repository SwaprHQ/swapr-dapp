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
  const [rewards, setRewards] = useState<ExpeditionsContext['rewards']>()

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true)
      ExpeditionsAPI.getExpeditionsWeeklyfragments({ address: account })
        .then(userRewards => {
          setRewards(userRewards)
        })
        .catch(error => {
          console.error(error)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [account, isOpen])

  return (
    <ExpeditionsContext.Provider
      value={
        {
          provider,
          userAddress: account,
          isLoading,
          rewards,
          setRewards,
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
