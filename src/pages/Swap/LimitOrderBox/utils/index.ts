import { AddressZero } from '@ethersproject/constants'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { ChainId, Token, TokenAmount, USDC } from '@swapr/sdk'

import createDebugger from 'debug'

import { isAddress } from '../../../../utils'
import { IComputeNewAmount, InputFocus, LimitOrderKind, MarketPrices, SerializableLimitOrder } from '../interfaces'
import { TokenAmount as ITokenAmount } from '../interfaces/token.interface'

/**
 *
 * @param amount The amount of tokens to be bought or sold
 * @returns
 */
export const formatTokenAmount = (amount: ITokenAmount) => formatUnits(amount.amount, amount.token.decimals)

export const debug = createDebugger('limit-orders')

interface InitialState {
  sellTokenAmount: TokenAmount
  buyTokenAmount: TokenAmount
  limitOrder: SerializableLimitOrder
}

/**
 *
 * @param chainId The chain id of the network
 */
export function getInitialState(chainId: ChainId, account: string): InitialState {
  const sellTokenAmount = new TokenAmount(Token.getNativeWrapper(chainId), '1000000000000000000')
  const buyTokenAmount = new TokenAmount(USDC[chainId], '0')

  const limitOrder: SerializableLimitOrder = {
    sellAmount: '1000000000000000000',
    buyAmount: '0',
    feeAmount: '0',
    sellToken: isAddress(sellTokenAmount.currency.address) || AddressZero,
    buyToken: isAddress(buyTokenAmount?.currency?.address) || AddressZero,
    createdAt: 0,
    expiresAt: Date.now(),
    limitPrice: '0',
    userAddress: account,
    receiverAddress: account, // default reciver is the account itself
    kind: LimitOrderKind.SELL, // start with SELL, meaning selling WETH for USDC at or higher price than the current price
  }

  return {
    sellTokenAmount,
    buyTokenAmount,
    limitOrder,
  }
}

export function calculateMarketPriceDiffPercentage(
  limitOrderKind: LimitOrderKind,
  marketPrices: MarketPrices,
  formattedLimitPrice: string
) {
  const nextLimitPriceFloat = limitOrderKind === LimitOrderKind.SELL ? marketPrices.buy : marketPrices.sell
  let marketPriceDiffPercentage = 0
  let isDiffPositive = false

  if (Boolean(Number(nextLimitPriceFloat))) {
    if (limitOrderKind === LimitOrderKind.SELL) {
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

const multiplyPrice = (tokenAmount: number, limitPrice: number) => tokenAmount * limitPrice
const dividePrice = (tokenAmount: number, limitPrice: number) => (limitPrice === 0 ? 0 : tokenAmount / limitPrice)

const newAmountCalculationSellLimitOrder: Record<string, Function> = {
  [LimitOrderKind.SELL]: multiplyPrice,
  [LimitOrderKind.BUY]: dividePrice,
}
const newAmountCalculationBuyLimitOrder: Record<string, Function> = {
  [LimitOrderKind.SELL]: dividePrice,
  [LimitOrderKind.BUY]: multiplyPrice,
}

export const computeNewAmount = (
  buyTokenAmount: TokenAmount,
  sellTokenAmount: TokenAmount,
  limitPrice: number,
  limitOrderKind: string,
  inputFocus: InputFocus
): IComputeNewAmount => {
  const buyAmountFloat = parseFloat(formatUnits(buyTokenAmount.raw.toString(), buyTokenAmount.currency.decimals))
  const sellAmountFloat = parseFloat(formatUnits(sellTokenAmount.raw.toString(), sellTokenAmount.currency.decimals))

  let amount = 0
  let newBuyTokenAmount = buyTokenAmount
  let newSellTokenAmount = sellTokenAmount
  let buyAmountWei = '0'
  let sellAmountWei = '0'

  if (inputFocus === InputFocus.SELL) {
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
