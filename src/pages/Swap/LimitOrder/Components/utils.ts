import { formatUnits } from '@ethersproject/units'

import { Kind, MarketPrices } from '../../../../services/LimitOrders'

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
  formattedLimitPrice?: string
) {
  const nextLimitPriceFloat = limitOrderKind === Kind.Sell ? marketPrices.buy : marketPrices.sell
  let marketPriceDiffPercentage = 0
  let isDiffPositive = false

  if (Boolean(Number(nextLimitPriceFloat)) && formattedLimitPrice) {
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
