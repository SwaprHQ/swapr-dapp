import { Currency } from '@swapr/sdk'

import { useCallback, useEffect, useState } from 'react'

interface AutoMaxBalanceProps {
  onMax?: () => void
  onCurrencySelect?: (currency: Currency, isMaxAmount?: boolean) => void
}

export const useAutoMaxBalance = ({ onMax, onCurrencySelect }: AutoMaxBalanceProps) => {
  const [isMaxAmount, setIsMaxAmount] = useState<boolean>(false)

  useEffect(() => {
    if (isMaxAmount && onMax) {
      setIsMaxAmount(false)
      onMax()
    }
  }, [isMaxAmount, onMax])

  const handleOnCurrencySelect = useCallback(
    (inputCurrency, isMaxAmount) => {
      onCurrencySelect && onCurrencySelect(inputCurrency)
      setIsMaxAmount(isMaxAmount)
    },
    [onCurrencySelect]
  )

  return { handleOnCurrencySelect }
}
