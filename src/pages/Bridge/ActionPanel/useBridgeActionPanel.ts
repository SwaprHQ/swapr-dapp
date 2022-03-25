import { useCallback } from 'react'
import { useBridgeInfo } from '../../../services/Omnibridge/Omnibrige.hooks'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'

export const useBridgeActionPanel = () => {
  const omnibridge = useOmnibridge()
  const { bridgeCurrency } = useBridgeInfo()

  const handleApprove = useCallback(async () => {
    if (!omnibridge.ready) return
    await omnibridge.approve()
  }, [omnibridge])

  return {
    handleApprove,
    bridgeCurrency
  }
}
