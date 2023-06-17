import { formatUnits } from '@ethersproject/units'

import { Kind, MarketPrices } from '../../../../services/LimitOrders'

// import { Dispatch, SetStateAction } from 'react'

// import { getQuote } from '../api/cow'
// import { SerializableLimitOrder } from '../../interfaces'

// export const checkMaxOrderAmount = async (
//   limitOrder: SerializableLimitOrder,
//   setIsPossibleToOrder: (value: SetStateAction<{ status: boolean; value: number }>) => void,
//   setLimitOrder: Dispatch<SetStateAction<SerializableLimitOrder>>,
//   amountWei: string,
//   expiresAt: number,
//   sellTokenAmount: TokenAmount,
//   sellCurrencyMaxAmount: CurrencyAmount | undefined,
//   chainId: number,
//   provider: Web3Provider
// ) => {
//   const signer = provider.getSigner()

//   if (limitOrder.sellToken === limitOrder.buyToken) {
//     return
//   }

//   const { quote } = await getQuote({
//     chainId,
//     signer,
//     order: { ...limitOrder, sellAmount: amountWei, expiresAt: expiresAt },
//   })

//   if (!quote || !sellCurrencyMaxAmount?.raw) {
//     setIsPossibleToOrder({
//       status: true,
//       value: 0,
//     })
//     return
//   }

//   const { sellAmount } = quote
//   const totalSellAmount = Number(formatUnits(sellAmount, sellTokenAmount.currency.decimals) ?? 0)
//   const maxAmountAvailable = Number(
//     formatUnits(sellCurrencyMaxAmount.raw.toString(), sellTokenAmount.currency.decimals) ?? 0
//   )
//   // Since fee amount is recalculated again before order
//   if (totalSellAmount > maxAmountAvailable) {
//     const maxSellAmountPossible = maxAmountAvailable < 0 ? 0 : maxAmountAvailable
//     setIsPossibleToOrder({
//       status: true,
//       value: maxSellAmountPossible,
//     })
//   } else {
//     setIsPossibleToOrder({
//       status: false,
//       value: 0,
//     })
//   }
// }

export const formatMaxValue = (value: number) => {
  if (value === 0) return 0
  else if (value < 10) return value.toFixed(5)
  else if (value < 100) return value.toFixed(4)
  else if (value < 1000) return value.toFixed(3)
  return value.toFixed(2)
}

export const formatMarketPrice = (amount: string, decimals: number, tokenAmount: string): number =>
  parseFloat(formatUnits(amount, decimals) ?? 0) / Number(tokenAmount)

export const toFixedSix = (price: number): string => {
  if (Number(price.toFixed(6)) === 0) return price.toString()

  return price.toFixed(6)
}

export function calculateMarketPriceDiffPercentage(
  limitOrderKind: Kind,
  marketPrices: MarketPrices,
  formattedLimitPrice: string
) {
  const nextLimitPriceFloat = limitOrderKind === Kind.Sell ? marketPrices.buy : marketPrices.sell
  let marketPriceDiffPercentage = 0
  let isDiffPositive = false

  if (Boolean(Number(nextLimitPriceFloat))) {
    if (limitOrderKind === Kind.Sell) {
      marketPriceDiffPercentage = (Number(formattedLimitPrice) / Number(nextLimitPriceFloat.toFixed(6)) - 1) * 100
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) > 0
    } else {
      marketPriceDiffPercentage = (Number(nextLimitPriceFloat.toFixed(6)) / Number(formattedLimitPrice) - 1) * 100

      if (marketPriceDiffPercentage < 0) {
        marketPriceDiffPercentage = Math.abs(marketPriceDiffPercentage)
      } else {
        marketPriceDiffPercentage = Math.min(marketPriceDiffPercentage, 999)
        marketPriceDiffPercentage = marketPriceDiffPercentage * -1
      }
      isDiffPositive = Math.sign(Number(marketPriceDiffPercentage)) < 0
    }
  }

  marketPriceDiffPercentage = Math.min(marketPriceDiffPercentage, 999)
  return { marketPriceDiffPercentage, isDiffPositive }
}
