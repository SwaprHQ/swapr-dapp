import { Token, TokenAmount } from '@swapr/sdk'

import { formatUnits, parseUnits } from 'ethers/lib/utils'

import { Kind } from '../../../../../services/LimitOrders'

export interface IComputeNewAmount {
  amount: number
  buyAmountWei: string
  sellAmountWei: string
  newBuyTokenAmount: TokenAmount
  newSellTokenAmount: TokenAmount
}

const multiplyPrice = (tokenAmount: number, limitPrice: number) => tokenAmount * limitPrice
const dividePrice = (tokenAmount: number, limitPrice: number) => (limitPrice === 0 ? 0 : tokenAmount / limitPrice)

const newAmountCalculationSellLimitOrder: Record<string, Function> = {
  [Kind.Sell]: multiplyPrice,
  [Kind.Buy]: dividePrice,
}
const newAmountCalculationBuyLimitOrder: Record<string, Function> = {
  [Kind.Sell]: dividePrice,
  [Kind.Buy]: multiplyPrice,
}

export const computeNewAmount = (
  buyTokenAmount: TokenAmount,
  sellTokenAmount: TokenAmount,
  limitPrice: number,
  limitOrderKind: Kind
  // inputFocus: InputFocus
): IComputeNewAmount => {
  const buyAmountFloat = parseFloat(formatUnits(buyTokenAmount.raw.toString(), buyTokenAmount.currency.decimals))
  const sellAmountFloat = parseFloat(formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals))

  let amount = 0
  let newBuyTokenAmount = buyTokenAmount
  let newSellTokenAmount = sellTokenAmount
  let buyAmountWei = '0'
  let sellAmountWei = '0'

  if (limitOrderKind === Kind.Sell) {
    amount = newAmountCalculationSellLimitOrder[limitOrderKind](sellAmountFloat, limitPrice)
    buyAmountWei = parseUnits(amount.toFixed(6), buyTokenAmount?.currency?.decimals).toString()
    newBuyTokenAmount = new TokenAmount(buyTokenAmount.currency as Token, buyAmountWei)
  } else {
    amount = newAmountCalculationBuyLimitOrder[limitOrderKind](buyAmountFloat, limitPrice)
    sellAmountWei = parseUnits(amount.toFixed(6), sellTokenAmount?.currency?.decimals).toString()
    newSellTokenAmount = new TokenAmount(sellTokenAmount.currency as Token, sellAmountWei)
  }

  return {
    amount,
    buyAmountWei,
    sellAmountWei,
    newBuyTokenAmount,
    newSellTokenAmount,
  }
}
