import { useCallback } from 'react'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { useBridgeInfo } from '../../../state/bridge/hooks'

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
