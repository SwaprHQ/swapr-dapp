import { Web3Provider } from '@ethersproject/providers'
import { formatUnits } from '@ethersproject/units'
import { CurrencyAmount, TokenAmount } from '@swapr/sdk'

import { SetStateAction } from 'react'

import { getQuote } from '../../api'
import { SerializableLimitOrder } from '../../interfaces'

export const checkMaxOrderAmount = async (
  limitOrder: SerializableLimitOrder,
  setIsPossibleToOrder: (value: SetStateAction<{ status: boolean; value: number }>) => void,
  setLimitOrder: (value: SetStateAction<SerializableLimitOrder>) => void,
  amountWei: string,
  expiresAt: number,
  sellTokenAmount: TokenAmount,
  sellCurrencyMaxAmount: CurrencyAmount | undefined,
  chainId: number,
  provider: Web3Provider
) => {
  const signer = provider.getSigner()

  if (limitOrder.sellToken === limitOrder.buyToken) {
    return
  }

  const { quote } = await getQuote({
    chainId,
    signer,
    order: { ...limitOrder, sellAmount: amountWei, expiresAt: expiresAt },
  })

  if (!quote || !sellCurrencyMaxAmount?.raw) {
    setIsPossibleToOrder({
      status: true,
      value: 0,
    })
    return
  }

  const { sellAmount, feeAmount } = quote
  const sellAmountFormatted = Number(formatUnits(sellAmount, sellTokenAmount.currency.decimals) ?? 0)
  const feeAmountFormatted = Number(formatUnits(feeAmount, sellTokenAmount.currency.decimals) ?? 0)
  const maxAmount = Number(formatUnits(sellCurrencyMaxAmount.raw.toString(), sellTokenAmount.currency.decimals) ?? 0)
  // Since fee amount is recalculated again before order
  // for safe side checking 2x of current feeAmount returned by quote
  const totalSellAmount = sellAmountFormatted + feeAmountFormatted * 2
  setLimitOrder({ ...limitOrder, feeAmount: Number(feeAmount).toString() })
  if (totalSellAmount > maxAmount) {
    const maxSellAmountPossibleWithFee = maxAmount - feeAmountFormatted * 2 < 0 ? 0 : maxAmount - feeAmountFormatted * 2

    setIsPossibleToOrder({
      status: true,
      value: maxSellAmountPossibleWithFee,
    })
  } else {
    setIsPossibleToOrder({
      status: false,
      value: 0,
    })
  }
}

export const formatMaxValue = (value: number) => {
  if (value === 0) return 0
  else if (value < 10) return value.toFixed(5)
  else if (value < 100) return value.toFixed(4)
  else if (value < 1000) return value.toFixed(3)
  return value.toFixed(2)
}

export const formatMarketPrice = (amount: string, decimals: number): number =>
  parseFloat(formatUnits(amount, decimals) ?? 0) / 10
