import { useCallback } from 'react'
import { useOmnibridge } from '../../../services/Omnibridge/OmnibridgeProvider'
import { useBridgeInfo } from '../../../state/bridge/hooks'

export const useBridgeActionPanel = () => {
  const omnibridge = useOmnibridge()
  const { currencyId, bridgeCurrency } = useBridgeInfo()

  const handleApprove = useCallback(async () => {
    if (!currencyId || !bridgeCurrency || !omnibridge.ready) return
    await omnibridge.approve(currencyId, bridgeCurrency.symbol)
  }, [currencyId, bridgeCurrency, omnibridge])

  return {
    handleApprove,
    bridgeCurrency
  }
}
