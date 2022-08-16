import { Currency } from '@swapr/sdk'

import { useCallback, useLayoutEffect, useState } from 'react'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

interface AutoMaxBalanceProps {
  onMax?: () => void
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
}

export const useAutoMaxBalance = ({ onMax, onCurrencySelect }: AutoMaxBalanceProps) => {
  const [isMaxAmount, setIsMaxAmount] = useState<boolean>(false)

  useLayoutEffect(() => {
    if (isMaxAmount && onMax) {
      batchedUpdates(() => {
        setIsMaxAmount(false)
        onMax()
      })
    }

    return () => {
      setIsMaxAmount(false)
    }
  }, [isMaxAmount, onMax])

  const handleOnCurrencySelect = useCallback(
    (inputCurrency: Currency, isMaxAmount?: boolean) => {
      batchedUpdates(() => {
        if (onCurrencySelect) onCurrencySelect(inputCurrency)
        setIsMaxAmount(isMaxAmount ?? false)
      })
    },
    [onCurrencySelect]
  )

  return { handleOnCurrencySelect }
}
