import type { Web3Provider } from '@ethersproject/providers'

import { useEffect } from 'react'

import { HeaderButton } from '../../../components/Header/HeaderButton'
import { useShowExpeditionsPopup, useToggleShowExpeditionsPopup } from '../../../state/application/hooks'
import { ExpeditionsModal } from '../components/ExpeditionsModal'
import { useExpeditionsRefreshProgress } from '../Expeditions.hooks'

export interface SwaprExpeditionsAppProps {
  provider: Web3Provider
  account: string
}

export function ExpeditionsApp({ account }: SwaprExpeditionsAppProps) {
  const isOpen = useShowExpeditionsPopup()
  const toggleExpeditionsPopup = useToggleShowExpeditionsPopup()

  const refreshCampaignProgress = useExpeditionsRefreshProgress()

  useEffect(() => {
    if (isOpen) {
      refreshCampaignProgress(account)
    }
  }, [account, isOpen, refreshCampaignProgress])

  return (
    <>
      <HeaderButton onClick={toggleExpeditionsPopup} style={{ marginRight: '7px' }}>
        &#10024;&nbsp;Expeditions
      </HeaderButton>
      <ExpeditionsModal onDismiss={toggleExpeditionsPopup} />
    </>
  )
}
