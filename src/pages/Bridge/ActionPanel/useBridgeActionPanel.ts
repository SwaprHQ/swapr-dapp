import { useCallback } from 'react'
import { useBridgeInfo } from '../../../services/EcoBridge/EcoBridge.hooks'
import { useEcoBridge } from '../../../services/EcoBridge/EcoBridgeProvider'

export const useBridgeActionPanel = () => {
  const ecoBridge = useEcoBridge()
  const { bridgeCurrency } = useBridgeInfo()

  const handleApprove = useCallback(async () => {
    if (!ecoBridge.ready) return
    await ecoBridge.approve()
  }, [ecoBridge])

  return {
    handleApprove,
    bridgeCurrency,
  }
}
