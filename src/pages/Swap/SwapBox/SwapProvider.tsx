import { useState } from 'react'

import { useDerivedSwapInfo } from '../../../state/swap/hooks'
import { PlataformOverride, SwapContext } from './SwapContext'

export const SwapProvider = ({ children }: { children: React.ReactNode }) => {
  const [platformOverride, setPlatformOverride] = useState<PlataformOverride>(null)

  const { trade, allPlatformTrades, currencyBalances, parsedAmount, currencies, inputError, loading } =
    useDerivedSwapInfo(platformOverride || undefined)

  return (
    <SwapContext.Provider
      value={{
        trade,
        allPlatformTrades,
        currencyBalances,
        parsedAmount,
        currencies,
        inputError,
        loading,
        platformOverride,
        setPlatformOverride,
      }}
    >
      {children}
    </SwapContext.Provider>
  )
}
